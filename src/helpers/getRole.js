import cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';
import { cookieNames } from '~constants';

export default function getRole() {
  const contentManagerToken = cookies.get(cookieNames.token);

  if (!contentManagerToken) {
    return null;
  }

  const role = jwtDecode(contentManagerToken).roles[0];
  return role;
}
