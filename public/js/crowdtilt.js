var Crowdtilt = (function(){
	function Manager() {
		return {
		    //holds the campaign that was fetched last
		    campaign: null,
		    campaignData: null,
		    //holds the paying user
		    user: null,
		    userData: null,
		    //holds cc object
		    cc: null,
		    ccData: null,
		    //holds payment object,
		    payment: null,
		    
		    getCampaign: function (people) {
		        //get users campaigns
		        return $.getJSON('campaigns/'+people, $.proxy(function(data) {
		            this.campaign = data;
	            }, this));
		    },
		    createCampaign: function (params) {
		        //get crowdtilt user
		        return $.ajax({
                    type: "POST",
                    url: 'campaigns',
                    data: JSON.stringify(params),
                    success: $.proxy(function(data) {
                        this.campaign = data;
                    }, this),
                    dataType: "json"
                }); 
		    },
		    setUser: function (params) {
		        //get crowdtilt user
                clicky.log('#'+JSON.stringify(params),'User submitted');
		        return $.ajax({
                    type: "POST",
                    url: 'user',
                    data: JSON.stringify(params),
                    success: $.proxy(function(data) {
                        this.user = data;
                    }, this),
                    dataType: "json"
                }); 
		    },
		    setCreditCard: function(userId, params) {
		        //get crowdtilt payment for user
		        return $.ajax({
                    type: "POST",
                    url: 'user/'+userId+'/card',
                    data: JSON.stringify(params),
                    success: $.proxy(function(data) {
                        !data.error && (this.cc = data);
                    }, this),
                    dataType: "json"
                }); 
		    },
		    setPayment: function(campaignId, params) {
		        //get crowdtilt payment for user
                clicky.log('#'+JSON.stringify(params),'Donation submitted');
		        return $.ajax({
                    type: "POST",
                    url: 'campaign/'+campaignId+'/payment',
                    data: JSON.stringify(params),
                    success: $.proxy(function(data) {
                        !data.error && (this.payment = data);
                    }, this),
                    dataType: "json"
                }); 
		    }
		};
	};
	
	var instance;
	
	return {
		getInstance: function() {
			if (!instance) {
			    $.ajaxSetup({
                   headers: {
                       "Content-Type": "application/json"
                   }
                 });

				instance = new Manager();
			}
			
			return instance;
		}
	}

})();