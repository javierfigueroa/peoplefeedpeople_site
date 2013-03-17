var Crowdtilt = (function(){
	function Manager() {
		return {
		    campaign: {},
		    getCampaign: function (people, callback) {
		        //get users campaigns
		        $.getJSON('campaigns/'+people, function(data) {
		            this.campaign = data;
		            callback(this.campaign);
	            });
				return this;
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