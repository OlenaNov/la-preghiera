import { NavLink } from 'react-router-dom';
import list from '../../../list.json';

export const List = () => {
 
 return (
    <>
        <h1 className="title"></h1>
            <ul>
                {list.map(item => {
                    return (
                        <li key={item.id} className="item">
                            <NavLink to={`/la-preghiera/${item.id}`}>{item.name}</NavLink>
                        </li>
                    )
                })}
            </ul>
    </>
  );
};

export default List;