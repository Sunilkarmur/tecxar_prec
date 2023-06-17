import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const useAuth = () => {
    const auth = useSelector((state: RootState)=> state.auth)

    return {
        session: auth.isAuthenticated,
        user: auth.user,
        token: auth.token
    }
}

export default useAuth;