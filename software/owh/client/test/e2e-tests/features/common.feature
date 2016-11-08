Feature: Common functionality
  As a I view and update filters to view results for my searches
  I want to be able to go back few steps by the 'browser back button' and 'in-application back button' and undo the recently selected filters one at a time
  So that I can switch and update my filter selections

Scenario: Access mortality page
  When I am at home page
  And  I click on Explore button in Health Information Gateway section
#  Then I should get search page with default filter type mortality
#  And URL in browser bar should not be base URL

#Scenario: Filter options updated
#  When I update criteria in filter options with column "Autopsy"
#  Then URL in browser bar should change

#Scenario: Browser back button
#  When I selects the back button then browser URL should change
  #TODO When we implement feature to save query, results, hascode in database then we can enable commented steps
  #Then most recent filter action is removed and I am taken back by one step
  #And the results page (data table and visualizations) should be refreshed to reflect the currently selected filter options

#Scenario: Filter options updated
  #When I update criteria in filter options with column "Age Groups"
  #Then URL in browser bar should change

#Scenario: Browser back button
 # When I selects the back button in browser
 # Then URL in browser bar should change to previous URL

Scenario: Browser forward button
#  When I selects the forward button in browser then URL should change
  #TODO When we implement feature to save query, results, hascode in database then we can enable commented steps
  #Then I am taken forward by one step
  #And the results page (data table and visualizations) should be refreshed to reflect the currently selected filter options
