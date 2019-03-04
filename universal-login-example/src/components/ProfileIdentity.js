import React, {Component} from 'react';
import UserIco from '../img/user.svg';
import ProfileIdentityAccount from '../views/ProfileIdentityAccount';
import ProfileIdentityHeader from '../views/ProfileIdentityHeader';
import PropTypes from 'prop-types';

class ProfileIdentity extends Component {
  render() {
    const {identityService: {identity}, userName} = this.props;
    if (!identity.address) {
      return (<div/>);
    }
    switch (this.props.type) {
      case 'identityAccount':
        return (
          <ProfileIdentityAccount
            userIco={UserIco}
            userId={userName}
            address={identity.address}
          />
        );

      case 'identityHeader':
        return (
          <ProfileIdentityHeader
            userIco={UserIco}
            userId={userName}
            address={identity.address}
          />
        );

      default:
        break;
    }
  }
}

ProfileIdentity.propTypes = {
  type: PropTypes.string,
  identityService: PropTypes.object
};

export default ProfileIdentity;
