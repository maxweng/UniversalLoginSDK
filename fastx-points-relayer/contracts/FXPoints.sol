pragma solidity ^0.5.0;

import "./libraries/SafeMath.sol";
import "./libraries/NameFilter.sol";
import "./libraries/FXKeyCalc.sol";
import "./libraries/FXDatasets.sol";
import "./libraries/FXEvents.sol";

import "./interfaces/PlayerBookInterface.sol";


contract FXPoints is FXEvents {

    using SafeMath for uint256;
    using NameFilter for string;
    using FXKeyCalc for uint256;

    uint256 constant private ICO_ZERO_LEN = 60 minutes;
    uint256 constant private ROUND_GAP_LEN = 12 hours; 
    uint256 constant private ROUND_LEN = 24 hours;         // round timer starts at this
    uint256 constant private ROUND_LEN_MAX = ROUND_LEN;     // max length a round timer can be
    uint256 constant private TIME_INCREASE = 1 minutes;     // every full key purchased adds this much to the timer

    PlayerBookInterface private playerBook_;
    uint256 private _roundGap = ICO_ZERO_LEN;                       // length of ICO phase, set to 1 year for EOS.

    
    mapping (uint256 => FXDatasets.Player) public plyr_;   // (pID => data) player data
    mapping (address => uint256) public pIDxAddr_;          // (addr => pID) returns player id by address
    mapping (bytes32 => uint256) public pIDxName_;          // (name => pID) returns player id by name
    mapping (uint256 => mapping (bytes32 => bool)) public plyrNames_; // (pID => name => bool) list of names a player owns.  (used so you can change your display name amongst any name you own)

    uint256 public airDropPot_;             // person who gets the airdrop wins part of this pot

    uint256 public rID_;    // round id number / total rounds that have happened
    mapping (uint256 => FXDatasets.Round) public round_;   // (rID => data) round data
    mapping (uint256 => mapping (uint256 => FXDatasets.PlayerRounds)) public plyrRnds_;    // (pID => rID => data) player round data by player id & round id

    mapping (address=>uint) memberTokens_;

    // constructor() public {
    //     rID_ = 1;
    //     round_[rID_].strt = now;
    //     round_[rID_].end = now + ROUND_LEN + ICO_ZERO_LEN;
        
    //     address _owner = msg.sender;
    // }

    modifier onlyDevs() {
        // require(
        //     msg.sender == _owner ||
        //     msg.sender == 0xF38fd8319aFf0d37B41F912F8BD8f38779ec2071 ||
        //     msg.sender == 0x3f84C8504DB819791528FeaA6199069c521738F0,
        //     "dev team only"
        // );
        _;
    }

    function spend(uint256 _amount) public {
        // issue the tokens to the player
        address _member = msg.sender;
        if (_member == address(0))
        {
            _member == msg.sender;
        }
        uint256 _pID = pIDxAddr_[_member];

        plyrRnds_[_pID][rID_].keys += _amount;
        
        round_[rID_].keys += _amount;
    }

    function balanceOf(address _member) 
        public view
        returns (uint256)
    {
        if (_member == address(0))
        {
            _member == msg.sender;
        }
        uint256 _pID = pIDxAddr_[_member];
        
        return plyrRnds_[_pID][rID_].keys;
    }
    
    /**
     * @dev returns player earnings per vaults 
     * @return winnings vault
     * @return general vault
     * @return affiliate vault
     */
    function getPlayerVaults(uint256 _pID)
        public
        view
        returns(uint256 win, uint256 gen, uint256 aff)
    {
        return (
            plyr_[_pID].win,
            (plyr_[_pID].gen).add(calcUnMaskedEarnings(_pID, plyr_[_pID].lrnd)),
            plyr_[_pID].aff
        );
    }
    
    /**
     * @dev returns player info based on address.  if no address is given, it will 
     * use msg.sender 
     * @param _addr address of the player you want to lookup 
     * @return player ID 
     * @return player name
     * @return keys owned (current round)
     * @return winnings vault
     * @return general vault 
     * @return affiliate vault 
	 * @return player ico eth
     */
    function getPlayerInfoByAddress(address _addr)
        public 
        view 
        returns(uint256, bytes32, uint256, uint256, uint256, uint256, uint256)
    {
        if (_addr == address(0))
        {
            _addr == msg.sender;
        }
        uint256 _pID = pIDxAddr_[_addr];
        
        return (
            _pID,                               //0
            plyr_[_pID].name,                   //1
            plyrRnds_[_pID][rID_].keys, //2
            plyr_[_pID].win,                    //3
            (plyr_[_pID].gen),       //4
            plyr_[_pID].aff,                    //5
			plyrRnds_[_pID][rID_].ico           //6
        );
    }

    /**
     * @dev returns all current round info needed for front end
     * @return eth invested during ICO phase
     * @return round id 
     * @return total keys for round 
     * @return time round ends
     * @return time round started
     * @return current pot 
     * @return current player in leads address 
     * @return current player in leads name
     * @return airdrop tracker # & airdrop pot
     */
    function getCurrentRoundInfo() 
        public
        view
        returns(uint256, uint256, uint256, uint256, uint256, uint256, uint256, address, bytes32, uint256)
    {
        return
            (
                round_[rID_].ico,               //0
                rID_,                           //1
                round_[rID_].keys,              //2
                round_[rID_].end,               //3
                round_[rID_].strt,              //4
                round_[rID_].pot,               //5
                round_[rID_].plyr,              //6
                plyr_[round_[rID_].plyr].addr,  //7
                plyr_[round_[rID_].plyr].name,  //8
                airDropPot_                     //9
            );
    }

    /**
	 * @dev receives name/player info from names contract 
     */
    function receivePlayerInfo(uint256 _pID, address _addr, bytes32 _name, uint256 _laff)
        external
    {
        require (msg.sender == address(playerBook_), "Not PlayerBook contract... hmmm..");
        if (pIDxAddr_[_addr] != _pID)
            pIDxAddr_[_addr] = _pID;
        if (pIDxName_[_name] != _pID)
            pIDxName_[_name] = _pID;
        if (plyr_[_pID].addr != _addr)
            plyr_[_pID].addr = _addr;
        if (plyr_[_pID].name != _name)
            plyr_[_pID].name = _name;
        if (plyr_[_pID].laff != _laff)
            plyr_[_pID].laff = _laff;
        if (plyrNames_[_pID][_name] == false)
            plyrNames_[_pID][_name] = true;
    }

    /**
     * @dev receives entire player name list 
     */
    function receivePlayerNameList(uint256 _pID, bytes32 _name)
        external
    {
        require (msg.sender == address(playerBook_), "Mot PlayerBook contract... hmmm..");
        if(plyrNames_[_pID][_name] == false)
            plyrNames_[_pID][_name] = true;
    }

    function buyXaddr(uint256 _amount)
        // isActivated()
        // isHuman()
        // isWithinLimits(msg.value)
        public
        payable
    {
        // set up our tx event data and determine if player is new or not
        FXDatasets.EventReturns memory _eventData_;
        _eventData_ = determinePID(_eventData_);
        
        // fetch player id
        uint256 _pID = pIDxAddr_[msg.sender];
        
        // buy core 
        buyCore(_pID, _amount, _eventData_);
    }
  
    /**
     * @dev gets existing or registers new pID.  use this when a player may be new
     * @return pID 
     */
    function determinePID(FXDatasets.EventReturns memory _eventData_)
        private
        returns (FXDatasets.EventReturns memory)
    {
        uint256 _pID = pIDxAddr_[msg.sender];
        // if player is new 
        if (_pID == 0)
        {
            // grab their player ID, name and last aff ID, from player names contract 
            _pID = playerBook_.getPlayerID(msg.sender);
            bytes32 _name = playerBook_.getPlayerName(_pID);
            uint256 _laff = playerBook_.getPlayerLAff(_pID);
            
            // set up player account 
            pIDxAddr_[msg.sender] = _pID;
            plyr_[_pID].addr = msg.sender;
            
            if (_name != "")
            {
                pIDxName_[_name] = _pID;
                plyr_[_pID].name = _name;
                plyrNames_[_pID][_name] = true;
            }
            
            if (_laff != 0 && _laff != _pID)
                plyr_[_pID].laff = _laff;
            
            // set the new player bool to true
            _eventData_.compressedData = _eventData_.compressedData + 1;
        } 
        return (_eventData_);
    }

    /**
     * @dev logic runs whenever a buy order is executed.  determines how to handle 
     * incoming eth depending on if we are in ICO phase or not 
     */
    function buyCore(uint256 _pID, uint256 _amount, FXDatasets.EventReturns memory _eventData_)
        private
    {
        // check to see if round has ended.  and if player is new to round
        _eventData_ = manageRoundAndPlayer(_pID, _eventData_);
        
        // are we in ICO phase?
        // if (now <= round_[rID_].strt + _roundGap) 
        // {
        //     // let event data know this is a ICO phase buy order
        //     _eventData_.compressedData = _eventData_.compressedData + 2000000000000000000000000000000;
        
        //     // ICO phase core
        //     icoPhaseCore(_pID, msg.value, _team, _affID, _eventData_);
        
        // // round is live
        // } else {
        // let event data know this is a buy order
        _eventData_.compressedData = _eventData_.compressedData + 1000000000000000000000000000000;
        
        // call core
        core(_pID, _amount, _eventData_);
        // }
    }

    /**
     * @dev decides if round end needs to be run & new round started.  and if 
     * player unmasked earnings from previously played rounds need to be moved.
     */
    function manageRoundAndPlayer(uint256 _pID, FXDatasets.EventReturns memory _eventData_)
        private
        returns (FXDatasets.EventReturns memory)
    {
        // setup local rID
        uint256 _rID = rID_;
        
        // grab time
        uint256 currTick = now;
        
        // check to see if round has ended.  we use > instead of >= so that LAST
        // second snipe tx can extend the round.
        if (currTick > round_[_rID].end)
        {
            // check to see if round end has been run yet.  (distributes pot)
            if (round_[_rID].ended == false)
            {
                _eventData_ = endRound(_eventData_);
                round_[_rID].ended = true;
            }
            
            // start next round in ICO phase
            if (rID_ == 1) {
                _roundGap = ROUND_GAP_LEN;
            }
            rID_++;
            _rID = rID_;
            round_[_rID].strt = currTick;
            round_[_rID].end = currTick.add(ROUND_LEN).add(_roundGap);
        }
        
        // is player new to round?
        if (plyr_[_pID].lrnd != _rID)
        {
            // if player has played a previous round, move their unmasked earnings
            // from that round to gen vault.
            if (plyr_[_pID].lrnd != 0)
                updateGenVault(_pID, plyr_[_pID].lrnd);
            
            // update player's last round played
            plyr_[_pID].lrnd = _rID;
            
            // set the joined round bool to true
            _eventData_.compressedData = _eventData_.compressedData + 10;
        }
        
        return(_eventData_);
    }
    
    /**
     * @dev ends the round. manages paying out winner/splitting up pot
     */
    function endRound(FXDatasets.EventReturns memory _eventData_)
        private
        returns (FXDatasets.EventReturns memory)
    {
        // setup local rID
        uint256 _rID = rID_;
        
        // check to round ended with ONLY ico phase transactions
        if (round_[_rID].eth == 0 && round_[_rID].ico > 0)
            roundClaimICOKeys(_rID);
        
        // grab our winning player
        uint256 _winPID = round_[_rID].plyr;
        
        // grab our pot amount
        uint256 _pot = round_[_rID].pot;
        
        // calculate our winner share, community rewards, gen share, and amount reserved for next pot 
        uint256 _win = _pot.mul(48) / 100;
        uint256 _com = _pot.mul(5) / 100;
        uint256 _gen = _pot.mul(37) / 100;
        uint256 _res = (((_pot.sub(_win)).sub(_com)).sub(_gen));
        
        // calculate ppt for round mask
        uint256 _ppt = (_gen.mul(1000000000000000000)) / (round_[_rID].keys);
        uint256 _dust = _gen.sub((_ppt.mul(round_[_rID].keys)) / 1000000000000000000);
        if (_dust > 0)
        {
            _gen = _gen.sub(_dust);
            _res = _res.add(_dust);
        }
        
        // pay our winner
        plyr_[_winPID].win = _win.add(plyr_[_winPID].win);
        
        // dev rewards
        // plyr_[DEV_ID].addr.transfer(_com);

        // distribute gen portion to key holders
        round_[_rID].mask = _ppt.add(round_[_rID].mask);

        // fill next round pot with its share
        round_[_rID + 1].pot += _res;
        
        // prepare event data
        _eventData_.compressedData = _eventData_.compressedData + (round_[_rID].end * 1000000);
        _eventData_.compressedIDs = _eventData_.compressedIDs + (_winPID * 100000000000000000000000000);
        _eventData_.winnerAddr = plyr_[_winPID].addr;
        _eventData_.winnerName = plyr_[_winPID].name;
        _eventData_.amountWon = _win;
        _eventData_.genAmount = _gen;
        _eventData_.newPot = _res;
        
        return(_eventData_);
    }

    /**
     * @dev moves any unmasked earnings to gen vault.  updates earnings mask
     */
    function updateGenVault(uint256 _pID, uint256 _rIDlast)
        private 
    {
        uint256 _earnings = calcUnMaskedEarnings(_pID, _rIDlast);
        if (_earnings > 0)
        {
            // put in gen vault
            plyr_[_pID].gen = _earnings.add(plyr_[_pID].gen);
            // zero out their earnings by updating mask
            plyrRnds_[_pID][_rIDlast].mask = _earnings.add(plyrRnds_[_pID][_rIDlast].mask);
        }
    }

    /**
     * @dev calculates unmasked earnings (just calculates, does not update mask)
     * @return earnings in wei format
     */
    function calcUnMaskedEarnings(uint256 _pID, uint256 _rIDlast)
        private
        view
        returns(uint256)
    {
        // if player does not have unclaimed keys bought in ICO phase
        // return their earnings based on keys held only.
        if (plyrRnds_[_pID][_rIDlast].ico == 0)
            return(  (((round_[_rIDlast].mask).mul(plyrRnds_[_pID][_rIDlast].keys)) / (1000000000000000000)).sub(plyrRnds_[_pID][_rIDlast].mask)  );
        else
            if (now > round_[_rIDlast].strt + _roundGap && round_[_rIDlast].eth == 0)
                return(  (((((round_[_rIDlast].icoGen).mul(1000000000000000000)) / (round_[_rIDlast].ico).keys()).mul(calcPlayerICOPhaseKeys(_pID, _rIDlast))) / (1000000000000000000)).sub(plyrRnds_[_pID][_rIDlast].mask)  );
            else
                return(  (((round_[_rIDlast].mask).mul(calcPlayerICOPhaseKeys(_pID, _rIDlast))) / (1000000000000000000)).sub(plyrRnds_[_pID][_rIDlast].mask)  );
        // otherwise return earnings based on keys owed from ICO phase
        // (this would be a scenario where they only buy during ICO phase, and never 
        // buy/reload during round)
    }

    /**
     * @dev this is the core logic for any buy/reload that happens while a round 
     * is live.
     */
    function core(uint256 _pID, uint256 _eth, 
        FXDatasets.EventReturns memory _eventData_)
        private
    {
        // setup local rID
        uint256 _rID = rID_;
        
        // check to see if its a new round (past ICO phase) && keys were bought in ICO phase
        if (round_[_rID].eth == 0 && round_[_rID].ico > 0)
            roundClaimICOKeys(_rID);
        
        // if player is new to round and is owed keys from ICO phase 
        if (plyrRnds_[_pID][_rID].keys == 0 && plyrRnds_[_pID][_rID].ico > 0)
        {
            // assign player their keys from ICO phase
            plyrRnds_[_pID][_rID].keys = calcPlayerICOPhaseKeys(_pID, _rID);
            // zero out ICO phase investment
            plyrRnds_[_pID][_rID].ico = 0;
        }
            
        // mint the new keys
        uint256 _keys = (round_[_rID].eth).keysRec(_eth);
        
        // if they bought at least 1 whole key
        if (_keys >= 1e18)
        {
            updateTimer(_keys, _rID);

            // set new leaders
            if (round_[_rID].plyr != _pID)
                round_[_rID].plyr = _pID;  
            
            // set the new leader bool to true
            _eventData_.compressedData = _eventData_.compressedData + 100;
        }
        
        /*
        // Get a chance to win airdrop if >= 0.1ETH
        if (_eth >= 1e17)
        {
            airDropTracker_++;
            if (airdrop() == true)
            {
                // gib muni
                uint256 _prize;
                if (_eth >= 10000000000000000000) 
                {
                    // calculate prize and give it to winner
                    _prize = ((airDropPot_).mul(75)) / 100;
                    plyr_[_pID].win = (plyr_[_pID].win).add(_prize);
                    
                    // adjust airDropPot 
                    airDropPot_ = (airDropPot_).sub(_prize);
                    
                    // let event know a tier 3 prize was won 
                    _eventData_.compressedData += 300000000000000000000000000000000;
                } else if (_eth >= 1000000000000000000 && _eth < 10000000000000000000) {
                    // calculate prize and give it to winner
                    _prize = ((airDropPot_).mul(50)) / 100;
                    plyr_[_pID].win = (plyr_[_pID].win).add(_prize);
                    
                    // adjust airDropPot 
                    airDropPot_ = (airDropPot_).sub(_prize);
                    
                    // let event know a tier 2 prize was won 
                    _eventData_.compressedData += 200000000000000000000000000000000;
                } else if (_eth >= 100000000000000000 && _eth < 1000000000000000000) {
                    // calculate prize and give it to winner
                    _prize = ((airDropPot_).mul(25)) / 100;
                    plyr_[_pID].win = (plyr_[_pID].win).add(_prize);
                    
                    // adjust airDropPot 
                    airDropPot_ = (airDropPot_).sub(_prize);
                    
                    // let event know a tier 1 prize was won 
                    _eventData_.compressedData += 100000000000000000000000000000000;
                }
                // set airdrop happened bool to true
                _eventData_.compressedData += 10000000000000000000000000000000;
                // let event know how much was won 
                _eventData_.compressedData += _prize * 1000000000000000000000000000000000;
                
                // reset air drop tracker
                airDropTracker_ = 0;
            }
        }
        */

        // store the air drop tracker number (number of buys since last airdrop)
        // _eventData_.compressedData = _eventData_.compressedData + (airDropTracker_ * 1000);

        // Give 10% bonus keys if the player is got referred
        // if (_affID != _pID && plyr_[_affID].name != "")
        //     _keys = _keys.add(_keys/10);
        
        // update player 
        plyrRnds_[_pID][_rID].keys = _keys.add(plyrRnds_[_pID][_rID].keys);
        
        // update round
        round_[_rID].keys = _keys.add(round_[_rID].keys);
        round_[_rID].eth = _eth.add(round_[_rID].eth);
        // rndTmEth_[_rID][_team] = _eth.add(rndTmEth_[_rID][_team]);

        // distribute eth
        // _eventData_ = distributeExternal(_rID, _pID, _eth, _affID, _eventData_);
        _eventData_ = distributeInternal(_rID, _pID, _eth, _keys, _eventData_);
        
        // call end tx function to fire end tx event.
        endTx(_rID, _pID, _eth, _keys, _eventData_);
    }
    
    /**
     * @dev takes keys bought during ICO phase, and adds them to round.  pays 
     * out gen rewards that accumulated during ICO phase 
     */
    function roundClaimICOKeys(uint256 _rID)
        private
    {
        // update round eth to account for ICO phase eth investment 
        round_[_rID].eth = round_[_rID].ico;
                
        // add keys to round that were bought during ICO phase
        round_[_rID].keys = (round_[_rID].ico).keys();
        
        // store average ICO key price 
        round_[_rID].icoAvg = calcAverageICOPhaseKeyPrice(_rID);
                
        // set round mask from ICO phase
        uint256 _ppt = ((round_[_rID].icoGen).mul(1000000000000000000)) / (round_[_rID].keys);
        uint256 _dust = (round_[_rID].icoGen).sub((_ppt.mul(round_[_rID].keys)) / (1000000000000000000));
        if (_dust > 0)
            round_[_rID].pot = (_dust).add(round_[_rID].pot);   // <<< your adding to pot and havent updated event data
                
        // distribute gen portion to key holders
        round_[_rID].mask = _ppt.add(round_[_rID].mask);
    }

    /**
     * @dev at end of ICO phase, each player is entitled to X keys based on final 
     * average ICO phase key price, and the amount of eth they put in during ICO.
     * if a player participates in the round post ICO, these will be "claimed" and 
     * added to their rounds total keys.  if not, this will be used to calculate 
     * their gen earnings throughout round and on round end.
     * @return players keys bought during ICO phase 
     */
    function calcPlayerICOPhaseKeys(uint256 _pID, uint256 _rID)
        public 
        view
        returns(uint256)
    {
        if (round_[_rID].icoAvg != 0 || round_[_rID].ico == 0 )
            return(  ((plyrRnds_[_pID][_rID].ico).mul(1000000000000000000)) / round_[_rID].icoAvg  );
        else
            return(  ((plyrRnds_[_pID][_rID].ico).mul(1000000000000000000)) / calcAverageICOPhaseKeyPrice(_rID)  );
    }

    /**
     * @dev average ico phase key price is total eth put in, during ICO phase, 
     * divided by the number of keys that were bought with that eth.
     * @return average key price 
     */
    function calcAverageICOPhaseKeyPrice(uint256 _rID)
        public 
        view 
        returns(uint256)
    {
        return(  (round_[_rID].ico).mul(1000000000000000000) / (round_[_rID].ico).keys()  );
    }

    /**
     * @dev updates round timer based on number of whole keys bought.
     */
    function updateTimer(uint256 keys, uint256 rID)
        private
    {
        // calculate time based on number of keys bought
        uint256 newTimer = (((keys) / (1000000000000000000)).mul(TIME_INCREASE)).add(round_[rID].end);
        
        // grab the current time
        uint256 currTick = now;
        
        // compare to max and set new end time
        if (newTimer >= (ROUND_LEN_MAX).add(currTick))
            newTimer = ROUND_LEN_MAX.add(currTick);
        round_[rID].end = newTimer;
    }

    // /**
    //  * @dev distributes eth based on fees to com, aff, and pot swap
    //  */
    // function distributeExternal(
    //     uint256 _rID, uint256 _pID, uint256 _eth, uint256 _affID, 
    //     FXDatasets.EventReturns memory _eventData_)
    //     private
    //     returns(FXDatasets.EventReturns memory)
    // {        
    //     // pay 1% out to next round
    //     uint256 nextSeed = _eth / 100;
    //     uint256 nextRoundId = _rID+1;
    //     round_[nextRoundId].pot += nextSeed;

    //     // pay 5% out to community rewards
    //     uint256 _com = _eth / 20;
    //     plyr_[DEV_ID].addr.transfer(_com);

    //     uint256 _affTop = calcReferrals(_rID, _pID, _eth, _affID);

    //     if (_affTop > 0) {
    //         plyr_[CMO_ID].addr.transfer(_affTop);
    //     }

    //     return(_eventData_);
    // }

    /**
     * @dev distributes eth based on fees to gen and pot
     */
    function distributeInternal(uint256 _rID, uint256 _pID, uint256 _eth, 
        uint256 _keys, 
        FXDatasets.EventReturns memory _eventData_)
        private
        returns(FXDatasets.EventReturns memory)
    {
        // calculate gen share
        uint256 dividends = (_eth.mul(63)) / 100;
        
        // toss 2% into airdrop pot 
        uint256 _air = (_eth / (100 / 2));
        airDropPot_ = airDropPot_.add(_air);
        
        // update eth balance (eth = eth - (dev share + aff share + airdrop pot share))
        _eth = _eth.sub((_eth.mul(5 + 10 + 2)) / 100);
        
        // calculate pot
        uint256 pot = _eth.sub(dividends);
        
        // distribute gen share (thats what updateMasks() does) and adjust
        // balances for dust.
        uint256 dust = updateMasks(_rID, _pID, dividends, _keys);
        if (dust > 0)
            dividends = dividends.sub(dust);
        
        // add eth to pot
        round_[_rID].pot = pot.add(dust).add(round_[_rID].pot);
        
        // set up event data
        _eventData_.genAmount = dividends.add(_eventData_.genAmount);
        _eventData_.potAmount = pot;
        
        return(_eventData_);
    }

    /**
     * @dev prepares compression data and fires event for buy or reload tx's
     */
    function endTx(
        uint256 _rID, uint256 _pID, uint256 _eth, uint256 _keys, 
        FXDatasets.EventReturns memory _eventData_)
        private
    {
        _eventData_.compressedData = _eventData_.compressedData + (now * 1000000000000000000);
        _eventData_.compressedIDs = _eventData_.compressedIDs + _pID + (_rID * 10000000000000000000000000000000000000000000000000000);
        
        emit FXEvents.onEndTx
        (
            _eventData_.compressedData,
            _eventData_.compressedIDs,
            plyr_[_pID].name,
            msg.sender,
            _eth,
            _keys,
            _eventData_.winnerAddr,
            _eventData_.winnerName,
            _eventData_.amountWon,
            _eventData_.newPot,
            _eventData_.genAmount,
            _eventData_.potAmount,
            airDropPot_
        );
    }

    /**
     * @dev updates masks for round and player when keys are bought
     * @return dust left over 
     */
    function updateMasks(uint256 _rID, uint256 _pID, uint256 _gen, uint256 _keys)
        private
        returns(uint256)
    {
        /* MASKING NOTES
            earnings masks are a tricky thing for people to wrap their minds around.
            the basic thing to understand here.  is were going to have a global
            tracker based on profit per share for each round, that increases in
            relevant proportion to the increase in share supply.
            
            the player will have an additional mask that basically says "based
            on the rounds mask, my shares, and how much i've already withdrawn,
            how much is still owed to me?"
        */
        
        // calc profit per key & round mask based on this buy:  (dust goes to pot)
        uint256 _ppt = (_gen.mul(1000000000000000000)) / (round_[_rID].keys);
        round_[_rID].mask = _ppt.add(round_[_rID].mask);
            
        // calculate player earning from their own buy (only based on the keys
        // they just bought).  & update player earnings mask
        uint256 _pearn = (_ppt.mul(_keys)) / (1000000000000000000);
        plyrRnds_[_pID][_rID].mask = (((round_[_rID].mask.mul(_keys)) / (1000000000000000000)).sub(_pearn)).add(plyrRnds_[_pID][_rID].mask);
        
        // calculate & return dust
        return(_gen.sub((_ppt.mul(round_[_rID].keys)) / (1000000000000000000)));
    }

    /** upon contract deploy, it will be deactivated.  this is a one time
     * use function that will activate the contract.  we do this so devs 
     * have time to set things up on the web end                            
     */
    bool public activated_ = false;
    function activate(address _book)
        onlyDevs()
        public
    {
        // can only be ran once
        require(activated_ == false, "System already activated");
        
        // activate the contract 
        activated_ = true;

        playerBook_= (PlayerBookInterface)(_book);
        
        // lets start first round in ICO phase
        rID_ = 1;
        round_[1].strt = now;
        round_[1].end = now + ROUND_LEN + ICO_ZERO_LEN;
    }
}