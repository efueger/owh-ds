Feature: As a User
  I want the sidebar layout in YRBS to be similar to Mortality
  So that there is consistency in the design
  I want to see the YRBS question categories in the given order
  So that I can see the most important question categories first


# TODO: Implement when we fix the e2e test cases issue
#  Scenario: Check/un-check a questions
#    When I click on "Select Questions" button
#    Then I see checkboxes for the questions in a tree
#    When I check a non-leaf node
#    Then I see all leaf node being selected
#    When I un-check one of the leaf nodes
#    Then I see the node is un-checked
#    And  I see it's parent node is also un-checked
#    But  I see it's siblings are not un-checked

  Scenario: Browser back button
    Given I am on search page
    When I change 'I'm interested in' dropdown value to "Bridged-Race Population Estimates"
    Then I should see Bridge race search page with filter type "Bridged-Race Population Estimates"
    When I select the back button in browser
    Then I should get search page with default filter type "Mortality"
    And the results page (mortality data table and visualizations) should be refreshed to reflect the currently selected filter options

  Scenario: Browser forward button
    When I select the forward button in browser
    Then I should see Bridge race search page with filter type "Bridged-Race Population Estimates"
    And the results page (bridged-Race data table and visualizations) should be refreshed to reflect the currently selected filter options
