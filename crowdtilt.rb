require 'httparty'

class Crowdtilt
  include HTTParty
  base_uri 'https://api-sandbox.crowdtilt.com/v1/'

  def initialize()
    @auth = {:username => "0bc4b80f7c1c7c14f9707222f2a59f", :password => "9a87139282b7337728200a753c3a8b3a916db8af"}
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
  def create_user(email, first_name, last_name)   
    #query for users
    users = self.class.get("/users", @options)["users"]
    #search for user by email
    user = users.find { |e| e['email'] == email.chomp}
    if user
      #found user, let's use it
      return user
    end
    
    #no user found, create one
    options = @options
    options.merge!({ 
      :body => { 
          :user => {
            :email => email, 
            :firstname => first_name, 
            :lastname => last_name 
          }
      }.to_json
    })
    self.class.post("/users", options)
  end
  
  def create_card(user_id, number, month, year, code)
    binding.pry 
    #query for cards
    url = "/users/"+user_id+"/cards"
    cards = self.class.get(url, @options)["cards"]
    #check for empty cards
    card = cards.find { |e| e['last_four'] == (number[-4..-1] || number)}
    if card
      #cards found return first one
      return card
    end
    
    #no card found, create one
    options = @options
    options.merge!({ 
      :body => { 
          :card => {
            :expiration_year => year, 
            :expiration_month => month,
            :security_code => code, 
            :number => number 
          }
      }.to_json
    })
    response = self.class.post(url, options)
    response["card"] || response
  end
end