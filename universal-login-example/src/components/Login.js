import React, {Component} from 'react';
import IdentitySelector from './IdentitySelector';
import PropTypes from 'prop-types';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      identity: ''
    };
    this.identityService = this.props.services.identityService;
    this.sdk = this.props.services.sdk;
    this.IbankService = this.props.services.IbankService;
    this.getUserName();
  }

  async getUserName() {
    let userName = await this.IbankService.getUserName();
    if(userName){
      //暂时写死域名，之后要改
      this.onNextClick(userName+'.'+process.env.ENS_DOMAIN_1)
    }
  }

  async identityExist(identity) {
    return await this.identityService.identityExist(identity);
  }

  async onNextClick(identityName) {
    const {emitter} = this.props.services;
    if (await this.identityExist(identityName)) {
      emitter.emit('setView', 'ApproveConnection');
      await this.identityService.connect();
    } else {
      this.identityService.identity.name = identityName;
      emitter.emit('setView', 'CreatingID');
      try {
        await this.identityService.createIdentity(identityName);
        emitter.emit('setView', 'Greeting', {greetMode: 'created'});
      } catch (err) {
        emitter.emit('setView', 'Failure', {error: err.message});
      }
    }
  }

  async onAccountRecoveryClick(identity) {
    const {emitter} = this.props.services;
    await this.identityExist(identity);
    emitter.emit('setView', 'RecoverAccount');
  }

  onChange(identity) {
    this.setState({identity});
  }

  render() {
    return (
      <div className="login-view">
        <div className="container">
          <h1 className="main-title">FastX Points Demo</h1>
          <IdentitySelector
            onNextClick={(identity) => this.onNextClick(identity)}
            onChange={this.onChange.bind(this)}
            onAccountRecoveryClick={this.onAccountRecoveryClick.bind(this)}
            services = {this.props.services}
            identitySelectionService={this.props.services.identitySelectionService}
          />
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  services: PropTypes.object
};


export default Login;
