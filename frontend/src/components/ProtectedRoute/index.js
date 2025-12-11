import {Redirect, Route} from 'react-router-dom'
import Cookies from 'js-cookie'

const ProtectedRoute = props => {
  const token = Cookies.get('jwtToken')
  if (token === undefined) {
    return <Redirect to="/sign-in" />
  }
  return <Route {...props} />
}

export default ProtectedRoute