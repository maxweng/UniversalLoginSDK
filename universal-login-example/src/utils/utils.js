function setParam(param, value) {
    var query = location.search.substring(1);
    var p = new RegExp("(^|)" + param + "=([^&]*)(|$)");
    if (p.test(query)) {
        var firstParam = query.split(param)[0];
        var secondParam = query.split(param)[1];
        if (secondParam.indexOf("&") > -1) {
            var lastPraam = secondParam.substring(secondParam.indexOf('&')+1);
            return '?' + firstParam + param + '=' + value + '&' + lastPraam;
        } else {
            if (firstParam) {
                return '?' + firstParam + param + '=' + value;
            } else {
                return '?' + param + '=' + value;
            }
        }
    } else {
        if (query == '') {
            return '?' + param + '=' + value;
        } else {
            return '?' + query + '&' + param + '=' + value;
        }
    }
}

function getQueryString(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export {sleep, setParam,getQueryString};
