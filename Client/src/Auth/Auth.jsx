import { Navigate, useLocation } from 'react-router-dom';
import useUser from '../Context/UserContext'
import { AppLoader} from '../Components';

const Auth = ({ children }) => {

  const { user, authLoding, hasFetchedUser } = useUser();

  if(authLoding || !hasFetchedUser){
    return(
      <div
       className='bg-zinc-50 h-screen w-full flex justify-center items-center'
       >
        <AppLoader
          style={'text-lg'}
         />
      </div>
    )
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  } ;

  return children;
};

export default Auth;
