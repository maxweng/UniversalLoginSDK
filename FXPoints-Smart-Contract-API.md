# FXPoints 系统智能合约

## 系统部署步骤

1. 部署 PlayerBook 
2. 部署 FXPoints
3. FXPoints.activate(PlayerBook.address)
4. PlayerBook.addGame(FXPoints.address, "fxpoints")



## 合约接口

### PlayerBook

- #### addGame(FXPoints address, FXPoints name)

用户信息添加到 FXPoints 里（FXPoints 合约地址，合约昵称）



### FXPoints

- #### activate(playerBook address)

激活合约（只能调用一次）



- #### buyXaddr(amount)

购买获得积分（amount为购买的数量，单位是wei）



- #### activated_()

合约是否已激活



- #### getCurrentRoundInfo()

获取当前轮信息

​     \* @return eth invested during ICO phase

​     \* @return round id 

​     \* @return total keys for round 

​     \* @return time round ends

​     \* @return time round started

​     \* @return current pot 

​     \* @return current player in leads address 

​     \* @return current player in leads name

​     \* @return airdrop tracker # & airdrop pot



- #### getPlayerInfoByAddress(Player address)

获取用户信息

​     \* @return player ID 

​     \* @return player name

​     \* @return keys owned (current round)

​     \* @return winnings vault

​     \* @return general vault 

​     \* @return affiliate vault 

​     \* @return player ico eth



- #### getPlayerVaults(Player ID)

获取用户收益

​     \* @return winnings vault

​     \* @return general vault

​     \* @return affiliate vault



- #### airDropPot_()

获取抽奖奖池余额