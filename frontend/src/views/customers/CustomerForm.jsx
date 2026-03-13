import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from '@/lib/axios';
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Upload, 
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function CustomerForm() {
	const { t } = useTranslation();
	const { id } = useParams();
	const navigate = useNavigate();
	const isEdit = !!id;

	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(isEdit);
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		official_domain: '',
		is_active: true
	});
	const [logo, setLogo] = useState(null);
	const [logoPreview, setLogoPreview] = useState(null);

	useEffect(() => {
		if (isEdit) {
			fetchCustomer();
		}
	}, [id]);

	const fetchCustomer = async () => {
		try {
			const response = await axios.get(`admin/customers/${id}`);
			const customer = response.data.data;
			setFormData({
				name: customer.name || '',
				email: customer.email || '',
				phone: customer.phone || '',
				official_domain: customer.official_domain || '',
				is_active: customer.is_active
			});
			if (customer.logo_url) {
				setLogoPreview(customer.logo_url);
			}
		} catch (error) {
			toast.error('Error al cargar el cliente');
			navigate('/customers');
		} finally {
			setFetching(false);
		}
	};

	const handleLogoChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setLogo(file);
			setLogoPreview(URL.createObjectURL(file));
		}
	};

	const removeLogo = () => {
		setLogo(null);
		setLogoPreview(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		const data = new FormData();
		Object.keys(formData).forEach(key => {
			if (formData[key] !== null) {
				data.append(key, formData[key] === true ? 1 : (formData[key] === false ? 0 : formData[key]));
			}
		});

		if (logo) {
			data.append('logo', logo);
		}

		if (isEdit) {
			data.append('_method', 'PUT');
		}

		try {
			const url = isEdit ? `admin/customers/${id}` : 'admin/customers';
			await axios.post(url, data, {
				headers: { 'Content-Type': 'multipart/form-data' }
			});
			toast.success(isEdit ? 'Cliente actualizado' : 'Cliente creado');
			navigate('/customers');
		} catch (error) {
			const message = error.response?.data?.message || 'Error al guardar';
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	if (fetching) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-20">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-slate-800">
					<Link to="/customers">
						<ArrowLeft className="h-5 w-5" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{isEdit ? t('customers.edit') : t('customers.create')}
					</h1>
					<p className="text-muted-foreground">
						{isEdit ? 'Modifica la información del cliente.' : 'Configura un nuevo cliente para el sistema de chatbots.'}
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="md:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Building2 className="h-4 w-4 text-cyan-500" /> {t('customers.general_info')}
								</CardTitle>
								<CardDescription>Datos principales de contacto.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-4">
								<div className="space-y-2">
									<Label htmlFor="name">{t('customers.name')}</Label>
									<Input 
										id="name"
										placeholder="Ej: Acme Corp"
										className="bg-slate-900/50 border-slate-800"
										value={formData.name}
										onChange={(e) => setFormData({...formData, name: e.target.value})}
										required
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="email" className="flex items-center gap-2">
											<Mail className="h-3 w-3" /> {t('customers.email')}
										</Label>
										<Input 
											id="email"
											type="email"
											placeholder="contacto@empresa.com"
											value={formData.email}
											onChange={(e) => setFormData({...formData, email: e.target.value})}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="phone" className="flex items-center gap-2">
											<Phone className="h-3 w-3" /> Teléfono
										</Label>
										<Input 
											id="phone"
											placeholder="+54 11 ..."
											className="bg-slate-900/50 border-slate-800"
											value={formData.phone}
											onChange={(e) => setFormData({...formData, phone: e.target.value})}
										/>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<Globe className="h-4 w-4 text-cyan-500" /> {t('customers.authorized_domain')}
							</CardTitle>
							<CardDescription>Para seguridad CORS del widget de chat.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="domain">Dominio (URL)</Label>
								<div className="relative">
									<p className="text-[10px] text-slate-500 mb-1 ml-1 flex items-center gap-1">
										<AlertCircle className="h-2.5 w-2.5" /> El widget solo funcionará en este dominio.
									</p>
									<Input 
										id="domain"
										placeholder="https://cliente.com"
										className="bg-slate-900/50 border-slate-800 pl-4 font-mono text-xs"
										value={formData.official_domain}
										onChange={(e) => setFormData({...formData, official_domain: e.target.value})}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm">{t('customers.logo')}</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col items-center gap-4">
							<div className="relative group">
								<div className="h-32 w-32 rounded-xl bg-slate-900 border-2 border-dashed border-slate-800 flex items-center justify-center overflow-hidden transition-all group-hover:border-cyan-500/50">
									{logoPreview ? (
										<img src={logoPreview} alt="Preview" className="h-full w-full object-contain" />
									) : (
										<Building2 className="h-10 w-10 text-slate-700" />
									)}
								</div>
								{logoPreview && (
									<button 
										type="button"
										onClick={removeLogo}
										className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<X className="h-3 w-3" />
									</button>
								)}
							</div>
							<div className="w-full">
								<Label 
									htmlFor="logo-upload" 
									className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-md cursor-pointer transition-colors text-xs font-medium"
								>
									<Upload className="h-3 w-3" /> Subir Logo
									<input 
										id="logo-upload"
										type="file"
										className="hidden"
										accept="image/*"
										onChange={handleLogoChange}
									/>
								</Label>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm">{t('customers.config')}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800">
								<div className="space-y-0.5">
									<Label className="text-sm">{t('customers.is_active')}</Label>
									<p className="text-[10px] text-muted-foreground">Permitir acceso al sistema.</p>
								</div>
								<Switch 
									checked={formData.is_active}
									onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
								/>
							</div>
						</CardContent>
					</Card>

					<div className="flex flex-col gap-3">
						<Button 
							type="submit" 
							disabled={loading}
							className="w-full py-6 text-lg"
						>
							{loading ? t('common.loading') : <><Save className="mr-2 h-5 w-5" /> {t('common.save')}</>}
						</Button>
						<Button asChild variant="ghost" className="w-full">
							<Link to="/customers">{t('common.cancel')}</Link>
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
