import { useParams } from 'react-router-dom';
import list from '../../../../list.json';

export const Prayer = () => {
    const { prayerId } = useParams();
    const currentPrayer = list.find(item => item.id === prayerId);

 return (
    <>
        <h2>{currentPrayer.name}</h2>
        <p>{currentPrayer.content}</p>
    </>
  );
};

export default Prayer;