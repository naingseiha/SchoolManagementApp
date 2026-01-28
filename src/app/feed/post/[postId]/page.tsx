import PostDetailsPage from "@/components/feed/post-details/PostDetailsPage";

interface PostDetailsProps {
  params: {
    postId: string;
  };
}

export default function PostDetails({ params }: PostDetailsProps) {
  return <PostDetailsPage postId={params.postId} />;
}
