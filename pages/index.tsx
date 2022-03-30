import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Header from '../components/Header';
import Banner from '../components/Banner'
import { sanityClient, urlFor } from "../sanity";
import { Post } from '../typings';
import Link from "next/link";

interface Props {
	posts: [Post];
}

export default function Home({ posts }: Props) {
	return (
    <div className="mx-auto max-w-7xl">
      <Head>
        <title>Medium Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <Banner />

      <div>
        {posts.map((post) => (
          <div className="grid grid-cols-1 gap-3 p-2 sm:grid-cols-2 md:gap-6 md:p-6 lg:grid-cols-3">
            <Link key={post._id} href={`/post/${post.slug.current}`}>
              <div className="border rounded-lg group cursor-pointer overflow-hidden">
                <img
                  className="h-60 w-full object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out"
                  src={urlFor(post.mainImage).url()!}
                />
                <div className="flex justify-between bg-white p-5">
                  <div>
                    <p className="text-lg font-bold">{post.title}</p>
                    <p className="text-xs">
                      {post.description} by {post.author.name}
                    </p>
                  </div>

                  <img
                    className="h-12 w-12 rounded-full"
                    src={urlFor(post.author.image).url()!}
                  />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export const getServerSideProps = async () => {
const query = `*[_type == "post"] {
_id,
title,
author -> {
name,
image
},
description,
mainImage,
slug
}`;

const posts = await sanityClient.fetch(query);

return {
props: {
posts,
}
}
}
