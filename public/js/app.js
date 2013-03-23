var products; //hold json from products
var donation; //holds the total donation value for a campaign
var shipping = 40; //shipping for 6 items
var userId = "USR78057B42890C11E2BC85BDD7562F032E";
var crowdtilt = new Crowdtilt.getInstance(); //Handle crowdtilt

$(function() {
    //Load templates
    $.Mustache.load('./tpl/templates.tpl.htm').done(function () {
        main();
    });
});


function main() {
    setupSlider();
    setGridContent();
    
    setCampaignContent(1);
    setWizard();
    setPaymentProcess();
    
    //Attach donation button event
    $(".donation-button").click(function() {
        //save button id to wizard
        var wizard = $('#rootwizard');
        wizard.data("bootstrapWizard").first();
        wizard.data("button", this.id);
    });
    
    $("#partial-button").click(function() {
        var form = $("#partial-donation-form"),
		    valid = form.valid();
        valid && form.submit();
        return false;
    });
 }
 
 function setupSlider() {
    $( "#slider" ).slider({
      value:1,
      min: 1,
      max: 6,
      step: 1,
      orientation: "horizontal",
      range: "min",
      slide: sliderMoved
    });
 }
 
 function sliderMoved( event, ui ) {
    var value = ui.value;
    //set people image when slider moves
    setPeopleImage(getPeopleMetadata(value));
    //change the x value in products    
    $(".times").text("x" + value);
    //change campaign monetary values
    setCampaignContent(value);
    //Log
    _gaq.push(['_trackEvent', 'Slider', 'Moved to ' + value, 'Previous campaign value is: ' + JSON.stringify(crowdtilt.campaignData) ]);
    clicky.log('#slider/home','Slider moved with value'+value);
}

function getPeopleMetadata(value) {
    switch (value) {
        case 2:
        return { color: "#FF6C00", people: 3, image: "img/people-3.png", times: 1 };
        case 3:
        return { color: "#FF7F00", people: 4, image: "img/people-4.png", times: 1 };
        case 4:
        return { color: "#FFB100", people: 6, image: "img/people-3.png", times: 2 };
        case 5:
        return { color: "#FFCB00", people: 8, image: "img/people-4.png", times: 2 };
        case 6:
        return { color: "#9FEE00", people: 14, image: "img/people-7.png", times: 2 };
        default:
        return { color: "#FF0700", people: 2, image: "img/people-2.png", times: 1 };
    }
}

function setPeopleImage(params) {
    var sliderRange = $("#slider .ui-slider-range"),
        image = params.image,
        times = params.times;
        
    sliderRange.css("background", params.color);

    $('#people-image').attr("src", image);
    var altImage = $('#people-image-alt');
    
    if (times > 1 && altImage.length > 0) {
        altImage.attr("src", image);
    }else if(times > 1 && altImage.length == 0){
        $('#peoples').append($("<img />", { 
            id: "people-image-alt",
            src: image
        }));
    }else{
        altImage.remove();
    }
}
 
function setGridContent() {
    //set donation form fixed
    $('#donation-form').scrollToFixed({ marginTop: 50});
    $("#grid").empty();
    $.getJSON("json/products.json", function(response) {
        var items = products = response.products,
            itemsLength = items.length,
            people = parseInt($('#slider').slider("option", "value")),
            sum = 0,
            i = 0;
            
        for ( ; i<itemsLength; i++) {
            var item = items[i];
            $('#grid').mustache('grid-item', {
                url: item.url,
                name: item.name,
                image: item.image,
                times: "x"+people
            });
            
            donation = sum += item.price;
        }
    });
}

function setWizard() {    
    $('#wizard').mustache('donation-wizard');
    $('#success-modal').mustache("campaign-tilted");
    $('#rootwizard').bootstrapWizard({
        tabClass: 'nav nav-pills',
        onTabClick: function(tab, navigation, index) {
    		return false;
    	},
    	onTabShow: function(tab, navigation, index) {
    		var $total = navigation.find('li').length;
    		var $current = index+1;
    		var $percent = ($current/$total) * 100;
    		$('#rootwizard').find('.bar').css({width:$percent+'%'});
		
    		// If it's the last tab then hide the last button and show the finish instead
    		if($current >= $total) {
    			$('#rootwizard').find('.pager .next').hide();
    			$('#rootwizard').find('.pager .finish').show();
    			$('#rootwizard').find('.pager .finish').removeClass('disabled');
    		} else {
    			$('#rootwizard').find('.pager .next').show();
    			$('#rootwizard').find('.pager .finish').hide();
    		}
		
    	},
        onNext: function(tab, navigation, index) {
            switch(index) {
                case 1: {
				    // Make sure we entered the name
    				var contactForm = $('#contact-form'),
    				    valid = contactForm.valid();
				    
    				valid && contactForm.submit();
    				return valid; 
                }
                case 2: {
                    var ccForm = $('#cc-form'),
    				    valid = ccForm.valid();

				    valid && ccForm.submit();
                    return valid;
                }
			}
	    }
	});
	
	//Validate contact information
	$('#contact-form').validate({
      rules: {
        "first-name": {
          minlength: 2,
          required: true
        },
        "email": {
          required: true,
          email: true
        },
        "last-name": {
          minlength: 2,
          required: true
        }
      },
      highlight: function(element) {
        $(element).closest('.control-group').removeClass('success').addClass('error');
      },
      success: function(element) {
        element
        .text('OK!').addClass('help-inline')
        .closest('.control-group').removeClass('error').addClass('success');
      },
      submitHandler: function(form) {
        crowdtilt.userData = {
            email: form["email"].value,
            firstname: form["first-name"].value,
            lastname: form["last-name"].value
        };
      }
     });
     
     
	//Validate payment information
	$('#cc-form').validate({
      rules: {
        "cc-number": {
          creditcard: true,
          required: true
        },
        "cc-month": {
          required: true,
          digits: true,
          min: 1,
          max: 12
        },
        "cc-year": {
          required: true,
          min: 2013,
          max: 2025,
          digits: true
        },
        "cc-code": {
            required: true,
            min: 100,
            max: 9999,
            digits: true
        }
      },
      highlight: function(element) {
        $(element).closest('.control-group').removeClass('success').addClass('error');
      },
      success: function(element) {
        element
        .text('OK!').addClass('help-inline')
        .closest('.control-group').removeClass('error').addClass('success');
      },
      submitHandler: function(form) {     
        crowdtilt.ccData = {
            number: form["cc-number"].value,
            expiration_month: form["cc-month"].value,
            expiration_year: form["cc-year"].value,
            security_code: form["cc-code"].value
        };
        
        var people = crowdtilt.campaign.metadata.people,
            firstname = crowdtilt.userData.firstname,
            cc = crowdtilt.ccData.number
            metadata = getPeopleMetadata(+people),
            value = getDonationValue();
           
        $("#conf-name").text(firstname);
        $("#conf-people").text(metadata.people);
        $("#conf-cc").text(cc.substring(cc.length - 4));
        $("#conf-amount").text("$"+value);
      }
     });
}

function setPaymentProcess() {
    var growl = {
        type: 'info'
    };
    
    $('#rootwizard .finish').click(function() {
        $.bootstrapGrowl("Starting transaction...", growl);
		crowdtilt.setUser(crowdtilt.userData).then(function() {
	        $.bootstrapGrowl("Processing your payment information...", growl);
		    crowdtilt.setCreditCard(crowdtilt.user.id, crowdtilt.ccData).then(function(){
		        $.bootstrapGrowl("Processing your donation...", growl);
		        crowdtilt.setPayment(crowdtilt.campaign.id, {
		            "user_id" : crowdtilt.user.id,
		            "amount" : getDonationValue() * 100,
		            "card_id" : crowdtilt.cc.id
		        }).then(function(payment){
		            //Payment went through show little message
		            $('#modal').modal('hide');
		            $.bootstrapGrowl("Everything was successful, thanks!", { type: "success" });
		            //Check if campaign was tilted		            
	                var campaign = payment.campaign;
		            if (campaign.stats.tilt_percent === 100) { 
		                //Show message
                    	$('#success-modal').modal('show');
		                crowdtilt.createCampaign({
		                    "user_id" : userId,
                            "title" : campaign.title,
                            "tilt_amount" : campaign.tilt_amount,
                            "metadata" : campaign.metadata
		                }).then(function(){
        		            setCampaignContent($( "#slider" ).slider("value"));
		                });
		            }else{
    		            setCampaignContent($( "#slider" ).slider("value"));
		            }
    		    });
		    });
		})
	});
}

function getDonationValue() {
    return $("#rootwizard").data("button") === "partial-button" ?
                        $("#partial-donation").val() : crowdtilt.campaignData.remainder;
}

function setCampaignContent(selection) {
    crowdtilt.getCampaign(selection).then(function(campaign) {
        var total = campaign.tilt_amount / 100,
            raised = campaign.stats.raised_amount / 100,
            remainder = total - raised;
            
        crowdtilt.campaignData = {
            total: total,
            raised: raised,
            remainder: remainder
        };
            
        $("#total-donation").text("$" + total);
        $("#raised-donation").text("$" + raised);
        $("#remainder-donation").text("$" + remainder);
        
        $("#partial-donation-form").validate({
          rules: {
            "donation": {
              minlength: 1,
              required: true,
              number: true,
              min: 1,
              max: remainder
            }
          },
          highlight: function(element) {
            $(element).closest('.control-group').removeClass('success').addClass('error');
          },
          errorClass: "help-inline error",
          errorPlacement: function(error, element) {
             error.insertAfter(element.siblings().first());
          },
          success: function(element) {
            element
            .closest('.control-group').removeClass('error').addClass('success');
          },
          submitHandler: function(form) {
            $("#modal").modal('show');
          }
         });
    });
}
 