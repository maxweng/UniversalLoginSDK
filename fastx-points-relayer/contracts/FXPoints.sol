pragma solidity ^0.5.2;

library FmDatasets {
    
    struct Player {
        address addr;   // player address
        bytes32 name;   // player name
        uint256 win;    // winnings vault
        uint256 gen;    // general vault
        uint256 aff;    // affiliate vault
        uint256 lrnd;   // last round played
        uint256 laff;   // last affiliate id used
    }
    
    struct Round {
        uint256 plyr;   // pID of player in lead
        uint256 team;   // tID of team in lead
        uint256 end;    // time ends/ended
        bool ended;     // has round end function been ran
        uint256 strt;   // time round started
        uint256 keys;   // keys
        uint256 eth;    // total eth in
        uint256 pot;    // eth to pot (during round) / final amount paid to winner (after round ends)
        uint256 mask;   // global mask
        uint256 ico;    // total eth sent in during ICO phase
        uint256 icoGen; // total eth for gen during ICO phase
        uint256 icoAvg; // average key price for ICO phase
    }
    
    struct PlayerRounds {
        uint256 eth;    // eth player has added to round (used for eth limiter)
        uint256 keys;   // keys
        uint256 mask;   // player mask 
        uint256 ico;    // ICO phase investment
    }
}

contract FXPoints {
    uint256 constant private ICO_ZERO_LEN = 60 minutes;
    uint256 constant private ROUND_GAP_LEN = 12 hours; 
    uint256 constant private ROUND_LEN = 24 hours;         // round timer starts at this

    event ButtonPress(address presser, uint pressTime, uint score);
    
    mapping (uint256 => FmDatasets.Player) public plyr_;   // (pID => data) player data
    mapping (address => uint256) public pIDxAddr_;          // (addr => pID) returns player id by address
    mapping (bytes32 => uint256) public pIDxName_;          // (name => pID) returns player id by name

    uint256 public rID_;    // round id number / total rounds that have happened
    mapping (uint256 => FmDatasets.Round) public round_;   // (rID => data) round data
    mapping (uint256 => mapping (uint256 => FmDatasets.PlayerRounds)) public plyrRnds_;    // (pID => rID => data) player round data by player id & round id

    mapping (address=>uint) memberTokens_;

    constructor() public {
        rID_ = 1;
        round_[rID_].strt = now;
        round_[rID_].end = now + ROUND_LEN + ICO_ZERO_LEN;
        
        address _owner = msg.sender;

        // premine the dev names (sorry not sorry)
        // No keys are purchased with this method, it's simply locking our addresses,
        // PID's and names for referral codes.
        plyr_[1].addr = _owner;
        plyr_[1].name = "owner";
        plyr_[1].win = 111;
        plyr_[1].gen = 222;
        plyr_[1].aff = 333;

        pIDxAddr_[_owner] = 1;
        pIDxName_["owner"] = 1;
        
        plyr_[2].addr = 0x63FC2aD3d021a4D7e64323529a55a9442C444dA0;
        plyr_[2].name = "devs";
        plyr_[2].win = 0;
        plyr_[2].gen = 0;
        plyr_[2].aff = 0;

        pIDxAddr_[0x63FC2aD3d021a4D7e64323529a55a9442C444dA0] = 2;
        pIDxName_["devs"] = 1;
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
        returns(uint256 ,uint256, uint256)
    {
        return (
            plyr_[_pID].win,
            (plyr_[_pID].gen), //.add(calcUnMaskedEarnings(_pID, plyr_[_pID].lrnd)),
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
     * @return dai in for round
     * @return airdrop tracker # & airdrop pot
     */
    function getCurrentRoundInfo() 
        public
        view
        returns(uint256, uint256, uint256, uint256, uint256, uint256, address, bytes32, uint256, uint256)
    {
        address leaderAddr = (address)(0x0);
        bytes32 leaderName = 0x0;

        return
            (
                (uint256)(0),               //0
                rID_,                           //1
                round_[rID_].keys,              //2
                round_[rID_].end,               //3
                round_[rID_].strt,              //4
                (uint256)(10000),               //5
                leaderAddr,  //7
                leaderName,  //8
                (uint256)(999),             //9
                (uint256)(20000)             //10
            );
    }
}