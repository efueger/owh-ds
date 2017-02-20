Feature: Natality filters
  As a user
  I want to see the data table upon selection of natality filters
  So that I can see the results of the filter options
  and I can quickly visualize and analyze the data

  Background: Access Natality page
    When I am at home page
    And  I click on Explore button in Health Information Gateway section
    Then I should get search page with default filter type "Mortality"
    When I change 'I'm interested in' dropdown value to "Natality"
    Then I should see Bridge race search page with filter type "Natality"

  Scenario: Default filter state
    Then I see "Year" as first option in sidebar filters
    And  filter "Year" and option "2014" selected
    And  I see the data table with race, female, male and total table headers
    And I see population count for "2014" option

  Scenario: Filter categories
    Then I see "Birth Characteristics" as first filter category
    And  I see 2 filters visible
    And  I see show more filters link
    When I click on show more filters link
    Then I see 11 filters visible
    And  I see show more filters link changed to show less filters
    When I click on show less filters
    Then I see 2 filters visible

