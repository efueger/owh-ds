Feature: Home page
  As a user
  I should be able to access home page
  In order to do further activities

Scenario: Access home page
  When I hit app url
  Then I should be automatically redirected to home page

Scenario: Access search page with default filter type mortality
  When I click on Explore button in Quick Health Data Online section
  Then I should get search page with default filter type mortality

Scenario: Access search page with filter type YRBS
  When I am at home page
  And I click on Explore button in Youth Related card under Behavioral Risk
  Then I should get search page with default filter type "Youth Risk Behavior"

Scenario: Access Birth card
  When I click on explore button in Birth card under womens health section
  Then I should get a info modal