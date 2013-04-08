var products; //hold json from products
var donation; //holds the total donation value for a campaign
var shipping = 40; //shipping for 6 items
var userId = "USR78057B42890C11E2BC85BDD7562F032E";
var crowdtilt = new Crowdtilt.getInstance(); //Handle crowdtilt
var processing = false;

$(function() {
    //Load templates
    $.Mustache.load('./tpl/templates.tpl.htm').done(function () {
        main();
    });
});


function main() {
    setupSlider();
    setGridContent();
    
    setCampaignContent();
    setWizard();
    setPaymentProcess();

    //partial donation form validation
    $("#partial-button").click(function() {
        //save button id to wizard
        var wizard = $('#rootwizard'),
            form = $("#partial-donation-form"),
		    valid = form.valid();
		    
        wizard.data("bootstrapWizard").first();
        wizard.data("button", this.id);
        valid && form.submit();
        return false;
    });
    
    //shortcuts keys events
    $(window).keypress(function(event) {
      if ( String.fromCharCode(event.which).toUpperCase() == "+") {
         $("#partial-donation").focus();
         return false;
      } else if ( String.fromCharCode(event.which).toUpperCase() == "*" ) {
          $("#full-button").trigger("click");
      }
    });
    
    // Init tooltips
    $("[data-toggle=tooltip]").tooltip("show");
    $('.carousel').carousel();
 }
 
 function setupSlider() {
    $( ".slider" ).slider({
      value:1,
      min: 1,
      max: 3,
      step: 1,
      orientation: "horizontal",
      range: "min",
      slide: sliderMoved,
      change: setCampaignContent
    });
 }
 
 function sliderMoved(event, ui) {
    var value = ui.value,
        id = this.id,
        metadata = getPeopleMetadata(value);
    
    if (id === "slider-people") {        
        //set people image when slider moves
        $("#slider .ui-slider-range").css("background", metadata.color);
        $('#people-image').attr("src", metadata.image);
    }else if (id === "slider-months") {
        $("#months-label").text(value === 1 ? value : (value-1) * 6);
    }else{ // slider-amount
        $(".amount-times").text(value+"x");
    }
    
    $("#total-donation").text("...");
    $("#partial-donation").val("...");
}

function getPeopleMetadata(value) {
    switch (value) {
        case 2:
        return { color: "#FF6C00", people: 3, image: "img/people-3.png", times: 1 };
        case 3:
        return { color: "#FF7F00", people: 4, image: "img/people-4.png", times: 1 };
        default:
        return { color: "#FF0700", people: 2, image: "img/people-2.png", times: 1 };
    }
}

function setGridContent() {
    //set donation form fixed
    $.getJSON("json/products.json", function(response) {
        var items = products = response.products,
            itemsLength = items.length,
            people = parseInt($('#slider-people').slider("option", "value")),
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
        
        $('#grid > :first-child').addClass("active");
    });
}

function setWizard() {    
    $('#wizard').mustache('donation-wizard');
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
        
        var metadata = parseMetadata(crowdtilt.campaign.metadata),
            people = metadata.people,
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

function parseMetadata(metadata) {
    var key = metadata.key.split("-");
    return {
        people: key[0],
        months: key[1],
        times: key[2]
    };
}

function getSliderValues() {
    return {
        people: $("#slider-people").slider("value"),
        months: $("#slider-months" ).slider("value"),
        times: $( "#slider-amount" ).slider("value")
    };
}

function setPaymentProcess() {
    var growl = {
        type: 'info'
    };
    
    $('#rootwizard .finish').click(function() {
        if (!processing) {       
            processing = true;  
            $('#rootwizard .finish').toggleClass("disabled");
            $.bootstrapGrowl("Starting transaction...", growl);
            
    		crowdtilt.setUser(crowdtilt.userData).then(function() {
    	        $.bootstrapGrowl("Processing your payment information...", growl);
    		    crowdtilt.setCreditCard(crowdtilt.user.id, crowdtilt.ccData).then(function(){
    		        $.bootstrapGrowl("Processing your donation...", growl);
    		        crowdtilt.setPayment(crowdtilt.campaign.id, {
    		            "user_id" : crowdtilt.user.id,
    		            "amount" : getDonationValue() * 100,
    		            "card_id" : crowdtilt.cc.id
    		        }).then(paymentProcessed);
    		    });
    		});
        }
	});
}

function paymentProcessed(payment){
    //Payment went through show little message
    processing = false;
    $('#modal').modal('hide');        
    $('#rootwizard .finish').toggleClass("disabled");
    $(".succces-modal-body").remove()
    $.bootstrapGrowl("Everything was successful, thanks!", { type: "success" });
    //Check if campaign was tilted		            
    var campaign = payment.campaign;
    if (campaign.stats.tilt_percent === 100) { 
        //Show tilted message
        $('#success-modal').mustache("campaign-tilted");
        crowdtilt.createCampaign({
            "user_id" : userId,
            "title" : campaign.title,
            "tilt_amount" : campaign.tilt_amount,
            "metadata" : campaign.metadata
        }).then(function(){
            setCampaignContent();
        });
    }else{
        //show regular success message
        $('#success-modal').mustache("donated-modal");
        setCampaignContent();
    }
    //show modal
	$('#success-modal').modal('show');
}

function getDonationValue() {
    return $("#rootwizard").data("button") === "partial-button" ?
                        $("#partial-donation").val() : crowdtilt.campaignData.remainder;
}

function setCampaignContent() {
    var sliderValues = getSliderValues(),
        people = getPeopleMetadata(sliderValues.people).people,
        months = sliderValues.months === 1 ? sliderValues.months : (sliderValues.months-1)*6,
        times = sliderValues.times;
        
    //set people number
    $(".people-number").text(people);
    $(".month-number").text(months == 1 ? "1 month" : months + " months");
    
    //get campaign
    crowdtilt.getCampaign(people+"-"+months+"-"+times).then(function(campaign) {
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
        $("#partial-donation").val(remainder);
        $("#contributions").text(campaign.stats.number_of_contributions);
        
        $("#partial-donation-form").validate({
          rules: {
            "donation": {
              minlength: 1,
              required: true,
              number: true,
              min: 1
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
         
        $("#partial-donation").rules("add", { max: remainder > 10000 ? 10000 : remainder});
    });
}
 