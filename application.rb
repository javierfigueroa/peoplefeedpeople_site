require 'rubygems'
require 'sinatra'
require 'pry'
require 'erb'
require 'json'
require_relative 'crowdtilt'

enable :sessions

get '/' do
  redirect '/index.html'
end

get '/campaigns/:people' do
  content_type :json
  crowdtilt = Crowdtilt.new
  campaigns = crowdtilt.campaigns("USR78057B42890C11E2BC85BDD7562F032E")["campaigns"]
  campaign = campaigns.find { |e| e['metadata']['people'] == params["people"]}
  return campaign.to_json
end

post '/user' do
  request.body.rewind  # in case someone already read it
  data = JSON.parse request.body.read
  crowdtilt = Crowdtilt.new
  user = crowdtilt.create_user(data["user"]["email"], data["user"]["first_name"], data["user"]["last_name"])
end