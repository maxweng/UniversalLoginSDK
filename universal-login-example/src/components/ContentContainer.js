import React, {Component} from 'react';
import Login from './Login';
import CreatingId from './CreatingId';
import ApproveConnection from './ApproveConnection';
import Failure from './Failure';
import Greeting from './Greeting';
import Account from './Account';
import MainScreen from './MainScreen';
import PendingAuthorizations from './PendingAuthorizations';
import Backup from './Backup';
import Trusted from './Trusted';
import RecoverAccount from './RecoverAccount';
import CoinCenter from './CoinCenter';
import PropTypes from 'prop-types';
import {scrollTo} from '../utils';
import {setParam} from '../utils/utils'
import 'semantic-ui-css/semantic.min.css'

class ContentContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'Login',
      viewParameters: {}
    };
  }

  componentDidMount() {
    const {emitter} = this.props.services;
    this.subscription = emitter.addListener('setView', this.setView.bind(this));
  }

  componentWillUnmount() {
    this.subscription.remove();
  }

  setView(view, viewParameters = {}) {
    this.setState({view, viewParameters});
    scrollTo(0, 0);  
  }

  render() {
    const {services} = this.props;
    if (this.state.view === 'Login') {
      return <Login services={services} />;
    } else if (this.state.view === 'CreatingID') {
      return <CreatingId identityService={this.props.services.identityService}/>;
    } else if (this.state.view === 'Failure') {
      return <Failure services={services} viewParameters={this.state.viewParameters} />;
    } else if (this.state.view === 'Greeting') {
      return <Greeting
        identityService={services.identityService}
        greetingService={services.greetingService}
        viewParameters={this.state.viewParameters} />;
    } else if (this.state.view === 'MainScreen') {
      // var url = window.location.href; //获取当前url          
      // if (url.indexOf("?")>0) {
      //     url = url.split("?")[0];
      // }
      // history.pushState(history.state, '', url+setParam("address", services.identityService.identity.address))
      return <MainScreen services={services}/>;      
    } else if (this.state.view === 'Account') {
      return (<Account identityService={services.identityService}/>);
    } else if (this.state.view === 'ApproveConnection') {
      return <ApproveConnection services={services}/>;
    } else if (this.state.view === 'PendingAuthorizations') {
      return <PendingAuthorizations services={services} setView={this.setView.bind(this)}/>;
    } else if (this.state.view === 'Backup') {
      return <Backup services={services} setView={this.setView.bind(this)}/>;
    } else if (this.state.view === 'Trusted') {
      return <Trusted setView={this.setView.bind(this)}/>;
    } else if (this.state.view === 'RecoverAccount') {
      return <RecoverAccount services={services} setView={this.setView.bind(this)}/>;
    } else if (this.state.view === 'CoinCenter') {
      return <CoinCenter identityService={services.identityService} IbankService={services.IbankService}/>;
    }
  }
}

ContentContainer.propTypes = {
  services: PropTypes.object
};

export default ContentContainer;
