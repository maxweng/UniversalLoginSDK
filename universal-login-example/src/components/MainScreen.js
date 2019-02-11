import React, {Component} from 'react';
import MainScreenView from '../views/MainScreenView';
import HeaderView from '../views/HeaderView';
import RequestsBadge from './RequestsBadge';
import AccountLink from './AccountLink';
import ProfileIdentity from './ProfileIdentity';
import PropTypes from 'prop-types';

class MainScreen extends Component {
  constructor(props) {
    super(props);
    const {services} = this.props;
    this.historyService = services.historyService;
    this.ensNameService = services.ensNameService;
    this.clickService = services.clickService;
    this.tokenService = services.tokenService;
    this.identityService = services.identityService;
    this.state = {lastClick: '0', lastPresser: 'nobody', events: [], loaded: false, busy: false};
  }

  setView(view) {
    const {emitter} = this.props.services;
    emitter.emit('setView', view);
  }

  async onClickerClick() {
    this.setState({busy: true});
    await this.clickService.click(() => this.setState({busy: false}));
  }

  async componentDidMount() {
    await this.updateClicksLeft();
    await this.updateFxPoints();
    this.historyService.subscribe(this.setState.bind(this));
    this.ensNameService.subscribe();
  }

  async updateClicksLeft() {
    const {address} = this.identityService.identity;
    const balance = await this.tokenService.getBalance(address);
    const clicksLeft = parseInt(balance, 10);
    this.setState({
      clicksLeft
    });
    this.timeout = setTimeout(this.updateClicksLeft.bind(this), 2000);
  }

  async updateFxPoints() {
    this.setState({
      fxPoints:0
    });
  }

  componentWillUnmount() {
    this.ensNameService.unsubscribeAll();
    this.historyService.unsubscribeAll();
    clearTimeout(this.timeout);
  }

  render() {
    return (
      <div>
        <HeaderView>
          <ProfileIdentity
            type="identityHeader"
            identityService={this.props.services.identityService}
          />
          <RequestsBadge
            setView={this.setView.bind(this)}
            services={this.props.services}
          />
          <AccountLink setView={this.setView.bind(this)} />
        </HeaderView>
        <MainScreenView
          clicksLeft={this.state.clicksLeft}
          events={this.state.events}
          loaded={this.state.loaded}
          busy={this.state.busy}
          onClickerClick={this.onClickerClick.bind(this)}
          lastClick={this.state.lastClick}
          fxPoints={this.state.fxPoints}
        />
      </div>
    );
  }
}

MainScreen.propTypes = {
  services: PropTypes.object
};

export default MainScreen;
