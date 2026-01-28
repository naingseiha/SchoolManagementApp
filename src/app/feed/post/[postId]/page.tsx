import PostDetailsPage from "@/components/feed/post-details/PostDetailsPage";

interface PostDetailsProps {
  params: {
    postId: string;
  };
}

// ✅ Configure for optimal client-side navigation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ✅ Generate metadata for better SEO and navigation
export async function generateMetadata({ params }: PostDetailsProps) {
  return {
    title: 'Post Details | Stunity',
    description: 'View post details and comments',
  };
}

export default function PostDetails({ params }: PostDetailsProps) {
  return <PostDetailsPage postId={params.postId} />;
}
