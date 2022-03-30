import { GetStaticProps } from "next";
import Header from "../../components/Header";
import { sanityClient, urlFor } from "../../sanity";
import { Post } from "../../typings";
import PortableText from "react-portable-text";

interface Props {
	post: Post;
}

function Post({ post }: Props) {
	return (
		<main>
			<Header />

			<img
				className="h-40 w-full object-cover"
				src={urlFor(post.mainImage).url()!}
				alt="{post.title}"
			/>

			<article className="mx-auto max-w-3xl p-5">
				<h1 className="mt-10 mb-3 text-3xl">{post.title}</h1>
				<h2 className="mb-2 text-xl font-light text-gray-500">{post.description}</h2>

				<div className="flex items-center space-x-2">
					<img
						className="h-10 w-10 rounded-full"
						src={urlFor(post.author.image).url()!}
					/>
					<p className="text-sm font-extralight">
						Blog post by <span className="text-green-600">{post.author.name}</span> - published at{' '}
						{new Date(post._createdAt).toLocaleDateString()}
					</p>
				</div>

				<div>
					<PortableText
					className=""
						dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
						projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
						content={post.body}
						serializers={
							{
								h1: (props: any) => (
									<h1 className="text-2xl font-bold my-5" {...props} />
								),
								h2: (props: any) => (
									<h1 className="text-xl font-bold my-5" {...props} />
								),
								li: ({ children }: any) => (
									<li className="ml-4 list-disc">{children}</li>
								),
								link: ({ href, children }: any) => (
									<a href={href} className="text-blue-600 hover:underline">
										{children}
									</a>
								)
							}
						}
					/>
				</div>
			</article>
		</main>
	)
}

export default Post;

export const getStaticPaths = async () => {
	const query = `*[_type == "post"]{
		_id,
		slug {
			current
		}
	}`;

	const post = await sanityClient.fetch(query);

	const paths = post.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }))

	return {
		paths,
		fallback: "blocking"
	}
};

export const getStaticProps: GetStaticProps = async ({params}) => {
	const query = `*[_type == "post" && slug.current == $slug][0] {
  		_id,
  		_createdAt,
  		title,
  		author -> {
  			name,
  			image
		},
		'comments': *[
  			_type == "comment" &&
  			post._ref == ^.id &&
  			approved == true],
		description,
		mainImage,
		slug,
		body
	}`

	const post = await sanityClient.fetch(query, {
		slug: params?.slug,
	});

	if(!post) {
		return {
			notFound: true
		}
	}

	return {
		props: {
			post,
		},
		revalidate: 60, // after 60 seconds it will update the old cache
	}
}