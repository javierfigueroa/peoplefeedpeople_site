require 'httparty'

class Crowdtilt
  include HTTParty
  base_uri 'https://api-sandbox.crowdtilt.com/v1/'

  def initialize()
    @auth = {
      :username => "0bc4b80f7c1c7c14f9707222f2a59f", 
      :password => "9a87139282b7337728200a753c3a8b3a916db8af"
    }
    
    @options = ({
      :basic_auth => @auth, 
      :headers => {"Content-Type" => "application/json"}
    })
  end

  # get campaigns for a user id
  def campaigns(user_id)
    self.class.get("/users/"+user_id+"/campaigns", @options)
  end
  
  # create a user for an email, check if it exists
  def create_user(data)   
    #query for users
    users = self.class.get("/users", @options)["users"]
    #search for user by email
    user = users.find { |e| e['email'] == data["email"].chomp}
    if user
      #found user, let's use it
      return user
    end
    
    #no user found, create one
    options = @options
    options.merge!({ 
      :body => { 
          :user => data
      }.to_json
    })
    self.class.post("/users", options)["user"]
  end
  
  # create a card for an email, check if it exists
  def create_card(user_id, data)
    #query for cards
    url = "/users/"+user_id+"/cards"
    cards = self.class.get(url, @options)["cards"]
    #check for empty cards
    card = cards.find { |e| e['last_four'] == (data["number"][-4..-1] || data["number"])}
    if card
      #cards found return first one
      return card
    end
    
    #no card found, create one
    options = @options
    options.merge!({ 
      :body => { 
          :card => data
      }.to_json
    })
    response = self.class.post(url, options)
    response["card"] || response
  end
  
  #create a payment for a campaign
  def create_payment(campaign_id, data)
    options = @options
    data.merge!({
      :user_fee_amount => 100,
      :admin_fee_amount => 40
    })
    options.merge!({ 
      :body => { 
          :payment => data
      }.to_json
    })
    self.class.post("/campaigns/"+campaign_id+"/payments", options)
  end
end