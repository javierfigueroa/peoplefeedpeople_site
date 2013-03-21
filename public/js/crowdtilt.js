var Crowdtilt = (function(){
	function Manager() {
		return {
		    //holds the campaign that was fetched last
		    campaign: null,
		    //holds the paying user
		    user: null,
		    //holds payment object
		    payment: null,
		    
		    getCampaign: function (people, callback) {
		        //get users campaigns
		        $.getJSON('campaign/'+people, $.proxy(function(data) {
		            this.campaign = data;
		            callback(this.campaign);
	            }, this));
				return this;
		    },
		    setUser: function (params, callback) {
		        //get crowdtilt user
		        $.ajax({
                    type: "POST",
                    url: 'user',
                    data: JSON.stringify(params),
                    success: $.proxy(function(data) {
                        this.user = data;
                        callback(this.user);
                    }, this),
                    dataType: "json"
                }); 
				return this;
		    },
		    setPayment: function(userId, params) {
		        var deferred = new $.Deferred();
		        //get crowdtilt payment for user
		        $.ajax({
                    type: "POST",
                    url: 'user/'+userId+'/card',
                    data: JSON.stringify(params),
                    success: $.proxy(function(data) {
                        !data.error && (this.payment = data);
                        deferred.resolve(data);
                    }, this),
                    dataType: "json"
                }); 
                
                return deferred.promise();
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