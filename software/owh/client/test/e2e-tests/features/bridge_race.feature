Feature: Bridge race filters
  As a user
  I want to see the data table upon selection of Bridged-Race filters
  So that I can see the results of the filter options
  and I can quickly visualize and analyze the data

  Background: Access Bridged-Race Population estimates page
    When I am at home page
    And  I click on Explore button in Health Information Gateway section
    Then I should get search page with default filter type "Mortality"
    When I change 'I'm interested in' dropdown value to "Bridged-Race Population Estimates"
    Then I should see Bridge race search page with filter type "Bridged-Race Population Estimates"


  Scenario: Default filter state
    Then I see "Yearly July 1st Estimates" as first option in sidebar filters
    And  filter "Yearly July 1st Estimates" and option "All" selected
    And  I see the data table with race, female, male and total table headers

  Scenario: Side filter collapse
    Then user sees side filter
    Then there is button to hide filter
    When I click hide filter button
    Then side menu slides away
    Then I see button to show filters
    When I click show filters button
    Then side menu slides back into view

  Scenario: Toggle row/column switch switches
    When I click on row button in row-column switch for "Yearly July 1st Estimates"
    Then I see "Yearly July 1st Estimates" filter in data table header

  Scenario: Expand/collapse a filter option
    When I click on sex filter
    Then I see male and female sub filters
    When I click on sex filter
    Then I see sex filter options disappeared

  Scenario: View axis labels for chart
    When user sees a visualization
    Then data element and values are plotted on both the axes
    And the Chart heading appears on the top eg. Race and Age Group
    And an axis labels is displayed on the graph
    And he should see an Expand button on the top right corner
    And he should see an Share button on the top right corner

  Scenario: Expand/collapse chart
    When user clicks on the expand button
    Then the graph must be expanded
    And  the expand button must be changed to collapse button
    And  he should see the legend on the top right corner
    When user clicks on the expand button
    Then the graph must be collapsed
    And  the collapse button must be changed to expand button
    And  he should see the legend on the top right corner