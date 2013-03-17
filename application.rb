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

#get campaigns from 1-6
get '/campaigns/:people' do
  content_type :json
  crowdtilt = Crowdtilt.new
  campaigns = crowdtilt.campaigns("USR78057B42890C11E2BC85BDD7562F032E")["campaigns"]
  campaign = campaigns.find { |e| e['metadata']['people'] == params["people"]}
  return campaign.to_json
end

#create user, return existing user if found
post '/user' do
  content_type :json
  request.body.rewind
  data = JSON.parse request.body.read
  crowdtilt = Crowdtilt.new
  crowdtilt.create_user(data["user"]["email"], data["user"]["first_name"], data["user"]["last_name"]).to_json
end

#create credit card, return existing card if found
post '/user/:id/card' do
  content_type :json
  request.body.rewind
  data = JSON.parse request.body.read
  crowdtilt = Crowdtilt.new
  crowdtilt.create_card(params["id"], data["number"], data["month"], data["year"], data["code"]).to_json
end