var Crowdtilt = (function(){
	function Manager() {
		return {
		    //holds the campaign that was fetched last
		    campaign: {},
		    //holds the paying user
		    user: {},
		    //
		    getCampaign: function (people, callback) {
		        //get users campaigns
		        $.getJSON('campaign/'+people, function(data) {
		            this.campaign = data;
		            callback(this.campaign);
	            });
				return this;
		    },
		    setUser: function (email, firstName, lastName, callback) {
		        //get users campaigns
		        $.ajax({
                    type: "POST",
                    url: 'user',
                    data: JSON.stringify({
                        email: email,
                        first_name: firstName,
                        last_name: lastName
                    }),
                    success: function(data) {
                        this.user = data;
                        callback(this.user);
                    },
                    dataType: "json"
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