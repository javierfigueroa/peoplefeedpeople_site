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
    // $("#peoples").empty();
    switch (value) {
        case 2:
        setPeopleImage("#FF6C00", "3", "img/people-3.png", 1);
        break;
        case 3:
        setPeopleImage("#FF7F00", "4", "img/people-4.png", 1);
        break;
        case 4:
        setPeopleImage("#FFB100", "6", "img/people-3.png", 2);
        break;
        case 5:
        setPeopleImage("#FFCB00", "8", "img/people-4.png", 2);
        break;
        case 6:
        setPeopleImage("#9FEE00", "14", "img/people-7.png", 2);
        break;
        default:
        setPeopleImage("#FF0700", "2", "img/people-2.png", 1);
        break;
    }
    
    $(".times").text("x" + value);
    setCampaignContent(value);
}

function setPeopleImage(color, people, image, times) {
    var sliderRange = $("#slider .ui-slider-range");
    sliderRange.css("background", color);

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
    $('#rootwizard').bootstrapWizard({
        tabClass: 'nav nav-pills',
        onTabClick: function(tab, navigation, index) {
    		return false;
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
    				    valid = ccForm.valid()
    				    payment = crowdtilt.payment;

				    valid && !payment && ccForm.submit();
                    return payment;
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
        crowdtilt.setUser({
            email: $("#email").val(),
            firstname: $("#first-name").val(),
            lastname: $("#last-name").val()
        }, function(user) {
            console.log(user);
        });
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
        crowdtilt.setPayment(crowdtilt.user.id, {
            number: $("#cc-number").val(),
            expiration_month: $("#cc-month").val(),
            expiration_year: $("#cc-year").val(),
            security_code: $("#cc-code").val()
        }).then(function(response) {
            console.log(response);
            if (response.error) {
                var message = response.error + ", please try a different one"
                $.bootstrapGrowl(message, {
                    type: 'error',
                    align: 'center',
                    width: 'auto'
                });
            }else{
                $('#rootwizard').data().bootstrapWizard.next();
            }
            
        });
      }
     });
}

function setCampaignContent(selection) {
    crowdtilt.getCampaign(selection, function(campaign) {
        var total = campaign.tilt_amount / 100,
            raised = campaign.stats.raised_amount / 100,
            remainder = total - raised;
            
        $("#total-donation").text("$" + total);
        $("#raised-donation").text("$" + raised);
        $("#remainder-donation").text("$" + remainder)
    });
}
 