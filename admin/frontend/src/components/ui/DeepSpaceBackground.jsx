import { useEffect, useState } from 'react';

function DeepSpaceBackground() {
	const [starts, setStars] = useState([]);
	const [nodes, setNodes] = useState([]);

	useEffect(() => {
		const newStars = Array.from({ length: 150 }).map((_, i) => ({
			id: i,
			x: Math.random() * 100,
			y: Math.random() * 100,
			size: Math.random() * 2 + 1,
			opacity: Math.random() * 0.6 + 0.4,
			twinkleDuration: Math.random() * 3 + 3,
			driftX: (Math.random() - 0.5) * 40,
			driftY: (Math.random() - 0.5) * 40,
			moveDuration: Math.random() * 40 + 60,
		}));

		const newNodes = Array.from({ length: 20 }).map((_, i) => ({
			id: i,
			x: Math.random() * 100,
			y: Math.random() * 100,
			vx: (Math.random() - 0.5) * 0.6,
			vy: (Math.random() - 0.5) * 0.6,
		}));

		setStars(newStars);
		setNodes(newNodes);
	}, []);

	const getConnections = () => {
		const connections = [];
		const maxDist = 15;
		for (let i = 0; i < nodes.length; i++) {
			for (let j = i + 1; j < nodes.length; j++) {
				const dx = nodes[i].x - nodes[j].x;
				const dy = nodes[i].y - nodes[j].y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < maxDist) {
					connections.push({
						x1: nodes[i].x,
						y1: nodes[i].y,
						x2: nodes[j].x,
						y2: nodes[j].y,
						opacity: (1 - dist / maxDist) * 0.15,
						key: `${i}-${j}`
					});
				}
			}
		}
		return connections;
	};

	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#020617]">
			<div className="absolute inset-0 z-0" style={{
				background: 'radial-gradient(circle at center, rgba(59,130,246,0.02) 0%, transparent 80%)'
			}} />

			<svg className="absolute inset-0 w-full h-full z-30 opacity-30" style={{ postition: 'absolute', width: '300%', height: '300%', left: '-100%', top: '-100%' }}>
				{getConnections().map(conn => (
					<line
						key={conn.key}
						x1={`${conn.x1}%`}
						y1={`${conn.y1}%`}
						x2={`${conn.x2}%`}
						y2={`${conn.y2}%`}
						stroke="white"
						strokeWidth={0.5}
						strokeOpacity={conn.opacity}
					/>
				))}
				{nodes.map(node => (
					<circle
						key={node.id}
						cx={`${node.x}%`}
						cy={`${node.y}%`}
						r={1.2}
						fill="white"
						fillOpacity={0.4}
						className="animate-node-drift"
						style={{
							'--node-vx': `${node.vx * 100}px`,
							'--node-vy': `${node.vy * 100}px`,
						}}
					/>
				))}
			</svg>

			{starts.map(star => (
				<div
					key={star.id}
					className="absolute bg-white rounded-full z-20 animate-star-twinkle"
					style={{
						left: `${star.x}%`,
						top: `${star.y}%`,
						width: star.size,
						height: star.size,
						boxShadow: star.size > 1.5 ? `0 0 3px rgba(255,255,255,0.4)` : 'none',
						animationDuration: `${star.twinkleDuration}s`,
						'--drift-x': `${star.driftX}px`,
						'--drift-y': `${star.driftY}px`,
					}}
				/>
			))}
		</div>
	);
}

export default DeepSpaceBackground;