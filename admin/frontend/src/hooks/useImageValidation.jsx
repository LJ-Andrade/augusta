import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/lib/axios';

const imageSettingsCache = {};

export function useImageValidation() {
	const [settings, setSettings] = useState({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadSettings();
	}, []);

	const loadSettings = async () => {
		try {
			const { data } = await axiosClient.get("/image-settings");
			const settingsMap = {};
			data.data.forEach((item) => {
				settingsMap[item.section] = item;
			});
			setSettings(settingsMap);
		} catch (error) {
			console.error('Error loading image settings:', error);
		} finally {
			setLoading(false);
		}
	};

	const validateFile = useCallback(async (file, section) => {
		const errors = [];
		const config = settings[section];

		if (!config || !config.active) {
			return { valid: true, errors: [] };
		}

		if (config.max_size_kb && file.size > config.max_size_kb * 1024) {
			errors.push(`El archivo excede el tamaño máximo de ${config.max_size_kb}KB`);
		}

		if (config.allowed_extensions) {
			const allowed = config.allowed_extensions.split(",").map(e => e.trim().toLowerCase());
			const ext = file.name.split(".").pop()?.toLowerCase();
			if (!allowed.includes(ext)) {
				errors.push(`Extensión no permitida. Permitidas: ${config.allowed_extensions}`);
			}
		}

		if (config.min_width || config.min_height || config.max_width || config.max_height || config.aspect_ratio) {
			const dimensionErrors = await validateDimensions(file, config);
			errors.push(...dimensionErrors);
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	}, [settings]);

	const validateDimensions = (file, config) => {
		return new Promise((resolve) => {
			const errors = [];
			const img = new Image();
			const url = URL.createObjectURL(file);

			img.onload = () => {
				const { width, height } = img;

				if (config.min_width && width < config.min_width) {
					errors.push(`El ancho mínimo es ${config.min_width}px (actual: ${width}px)`);
				}

				if (config.max_width && width > config.max_width) {
					errors.push(`El ancho máximo es ${config.max_width}px (actual: ${width}px)`);
				}

				if (config.min_height && height < config.min_height) {
					errors.push(`El alto mínimo es ${config.min_height}px (actual: ${height}px)`);
				}

				if (config.max_height && height > config.max_height) {
					errors.push(`El alto máximo es ${config.max_height}px (actual: ${height}px)`);
				}

				if (config.aspect_ratio) {
					const [w, h] = config.aspect_ratio.split(":").map(Number);
					const expectedRatio = w / h;
					const actualRatio = width / height;
					const tolerance = 0.02;

					if (Math.abs(actualRatio - expectedRatio) > tolerance) {
						errors.push(`El aspect ratio debe ser ${config.aspect_ratio} (actual: ${(width / height).toFixed(2)})`);
					}
				}

				URL.revokeObjectURLurl;
				resolve(errors);
			};

			img.onerror = () => {
				errors.push('No se pudo leer la imagen');
				URL.revokeObjectURLurl;
				resolve(errors);
			};

			img.src = url;
		});
	};

	const validateFiles = useCallback(async (files, section) => {
		if (!Array.isArray(files)) {
			files = [files];
		}

		const results = await Promise.all(
			files.map(async (file) => ({
				file,
				...await validateFile(file, section),
			}))
		);

		const invalidFiles = results.filter(r => !r.valid);

		return {
			valid: invalidFiles.length === 0,
			results,
			errors: invalidFiles.flatMap(r => r.errors),
		};
	}, [validateFile]);

	return {
		settings,
		loading,
		validateFile,
		validateFiles,
		reloadSettings: loadSettings,
	};
}

export function useImageValidationForSection(section) {
	const { validateFile, validateFiles, loading, settings } = useImageValidation();
	const config = settings[section];

	const validate = useCallback(async (fileOrFiles) => {
		if (loading) {
			return { valid: true, errors: [], message: 'Cargando configuración...' };
		}

		if (Array.isArray(fileOrFiles)) {
			const result = await validateFiles(fileOrFiles, section);
			return result;
		}

		return await validateFile(fileOrFiles, section);
	}, [validateFile, validateFiles, section, loading]);

	return {
		validate,
		config,
		loading,
	};
}
