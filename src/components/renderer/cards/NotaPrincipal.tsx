import type { ArticleBlock } from "../../../types/layout";
import { articleHref } from "./articleHref";

// NotaPrincipal.tsx
interface Props {
	article: ArticleBlock;
}

const NotaPrincipal = ({ article }: Props) => {
	const { snapshot } = article;
	return (
		<section
			className="flex flex-row w-full h-auto bg-white overflow-hidden group gap-5"
		>
			<a
				href={articleHref(snapshot)}
				className="relative w-[53%] shrink-0 overflow-hidden"
			>
				{/* Imagen izquierda */}
				{snapshot.imageUrl && (
					<img
						src={snapshot.imageUrl}
						alt={snapshot.title}
						className="w-full h-full object-cover transition-transform duration-300"
					/>
				)}

			</a>

			{/* Contenido derecho */}
			<div className="flex flex-col justify-start gap-2 py-3 w-full overflow-hidden">

				{/* Sección y Volanta */}
				<div className="flex flex-col gap-0">
					{snapshot.volanta && (
						<span
							className="text-[13px] font-bold uppercase tracking-wide leading-tight">
							{snapshot.volanta}
						</span>
					)}
				</div>

				{/* Título */}
				<h2 className="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight">
					{snapshot.title}
				</h2>

				{/* Descripción destacada (subtítulo en itálica) */}
				{snapshot.excerpt && (
					<p className="text-base italic text-gray-700 leading-snug">
						{snapshot.excerpt}
					</p>
				)}
				{/* Descripción (cuerpo)
				{descripcion && (
					<p className="text-[13px] text-gray-600 leading-snug line-clamp-5">
						{descripcion}
					</p>
				)} */}
			</div>
		</section>
	);
};

export default NotaPrincipal;