import React from 'react';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';

import { getDomain } from '../../utils';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import FirebaseContext from '../../firebase/context';
import { IVote } from '../../interfaces/vote';
import { ILink } from '../../interfaces/link';
import { FirebaseRef } from '../../interfaces/firebase';

interface IProps extends RouteComponentProps<{}> {
  link: ILink;
  index?: number;
  showCount: boolean;
}

const LinkItem: React.FC<IProps> = ({
  link,
  index,
  showCount = false,
  history
}) => {
  const { firebase, user } = React.useContext(FirebaseContext);

  const handleVote = async (): Promise<void> => {
    if (!user) {
      history.push('/login');
    } else {
      const voteRef: FirebaseRef = firebase.db.collection('links').doc(link.id);

      const doc = await voteRef.get();
      if (doc.exists) {
        const previousVotes = doc.data().votes;
        const vote: IVote = {
          voteBy: { id: user.uid, name: user.displayName }
        };
        const updatedVotes: IVote[] = [...previousVotes, vote];
        const voteCount = updatedVotes.length;
        voteRef.update({ votes: updatedVotes, voteCount });
      }
    }
  };

  const handleDeleteLink = async (): Promise<void> => {
    const linkRef: FirebaseRef = firebase.db.collection('links').doc(link.id);
    try {
      await linkRef.delete();
      console.log('link deleted');
    } catch (err) {
      console.error('Error deleting document', err);
    }
  };

  const postedByAuthUser: boolean = user && user.uid === link.postedBy.id;

  return (
    <div className="flex items-start mt2">
      <div className="flex items-center">
        {showCount && <span className="gray">{index}.</span>}
        <div className="vote-button" onClick={handleVote}>
          ⬆︎
        </div>
      </div>
      <div className="ml1">
        <div>
          <a href={link.url} className="black no-underline">
            {link.description}
          </a>{' '}
          <span className="link">({getDomain(link.url)})</span>
        </div>
        <div className="f6 lh-copy gray">
          {link.voteCount} votes by {link.postedBy.name}{' '}
          {distanceInWordsToNow(link.created)}
          {' | '}
          <Link to={`/link/${link.id}`}>
            {link.comments.length > 0
              ? `${link.comments.length} comments`
              : 'discuss'}
          </Link>
          {postedByAuthUser && (
            <>
              {' | '}
              <span className="delete-button" onClick={handleDeleteLink}>
                delete
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default withRouter(LinkItem);
