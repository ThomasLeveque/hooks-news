import React, { useContext } from 'react';
import { RouteComponentProps, match } from 'react-router-dom';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

import { CurrentUserContext } from '../../providers/current-user/current-user.provider';
import { firestore } from '../../firebase/firebase.service';
import { IComment } from '../../interfaces/comment.interface';
import Tag from '../../components/tag/tag.component';
import Loading from '../../components/loading/loading.component';
import { Link } from '../../models/link.model';

import './link-detail.styles.less';

type Params = { linkId: string };

interface IProps extends RouteComponentProps<{}> {
  match: match<Params>;
}

const LinkDetailPage: React.FC<IProps> = ({ match, history }) => {
  const { currentUser } = useContext(CurrentUserContext);

  const [link, setLink] = React.useState<Link>(null);
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [commentText, setCommentText] = React.useState<string>('');

  const linkId: string = match.params.linkId;
  const linkRef: firebase.firestore.DocumentReference = firestore.collection('links').doc(linkId);

  React.useEffect(() => {
    const unsubcribe = linkRef.onSnapshot(handleSnapshot, handleError);
    return () => unsubcribe();
  }, [linkId]);

  const handleSnapshot = (doc: firebase.firestore.DocumentSnapshot) => {
    const link: Link = new Link(doc);
    setLink(link);
    setIsLoaded(true);
  };

  const handleError = (err: any) => {
    setError(err.message || err.toString());
    setIsLoaded(true);
  };

  const handleAddComment = async () => {
    if (!currentUser) {
      history.push('/signin');
    } else {
      const doc: firebase.firestore.QueryDocumentSnapshot = await linkRef.get();
      if (doc.exists) {
        const previousComments = doc.data().comments;
        const comment = {
          postedBy: { id: currentUser.id, name: currentUser.displayName },
          created: Date.now(),
          text: commentText
        };
        const updatedComments = [...previousComments, comment];
        await linkRef.update({ comments: updatedComments });
        setCommentText('');
      }
    }
  };

  if (!isLoaded) {
    return <Loading />;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  return (
    <div className="link-detail-page">
      <div>
        <Tag text={link.category} color="green" />
        <p>{link.description}</p>
      </div>
      <textarea
        rows={6}
        cols={60}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setCommentText(event.target.value)}
        value={commentText}
      />
      <div>
        <button onClick={handleAddComment} className="button">
          Add Comment
        </button>
      </div>
      {link.comments.map((comment: IComment, index: number) => (
        <div key={index}>
          <p className="comment-author">
            {comment.postedBy.displayName} | {distanceInWordsToNow(comment.created)}
          </p>
          <p>{comment.text}</p>
        </div>
      ))}
    </div>
  );
};

export default LinkDetailPage;
