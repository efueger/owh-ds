Feature: Mortality page
  As a user
  I should be able to access mortality page
  I want to see labels on X and Y axis on the quick visualization
  So that I can instantly know what data is plotted on which axis
  I want to see raw data and percentages (as default results) when I select to view "Number of Deaths" in the main search bar
  So that I can see percentages along with number of deaths

Scenario: Access mortality page
  When I am at home page
  And  I click on Explore button in Health Information Gateway section
#  Then I should get search page with default filter type mortality

#Scenario: Axis labels
#  When user sees a visualization
#  Then labels are displayed on both the axes for minimized visualization
#  When user expand visualization
#  Then labels are displayed on both the axes for expanded visualization

#Scenario: Side filter collapse
#  Given user is on search page
#  Then user sees side filter
#  Then there is button to hide filter
#  When user clicks hide filter button
#  Then side menu slides away
#  Then user sees button to show filters
#  When user clicks show filters button
#  Then side menu slides back into view

#Scenario: Side filter options retain order
#  Given user is on search page
#  When user expands race options
#  When user selects second race option
#  Then race options retain their initial ordering

#Scenario: Display show/hide percentage button only on mortality page
#  When I am at home page
#  And  I click on Explore button in Health Information Gateway section
#  Then I should get search page with default filter type mortality
#  And an option to show/hide percentages is displayed
#  When I change 'I'm interested in' dropdown value to "Youth Risk Behavior"
#  Then I should be redirected to YRBS page
#  And show/hide percentages button shouldn't display

#Scenario: Death Rates
#  Given user is on search page
#  When the user chooses the option 'Death Rates'
#  Then the rates are shown for each row (with the Total population, from Bridge Race Estimates, as the denominator) - and not the total number of deaths shown in the table

#Scenario: Dropdown Location
#  Given user is on search page
#  Then dropdown is in the main search bar

#Scenario: Decimal Precision
#  Given user is on search page
#  When the user chooses the option 'Death Rates'
#  Then the Percentages should have a one decimal precision

#Scenario: Help Message above the quick visualization pane
#  Given user is on search page
#  When the user chooses the option 'Death Rates'
#  Then the following message should be displayed stating that population data is being retrieved from Census "Population details from NCHS Bridge Race Estimates is used to calculate Death Rates (per 100,000)"

#Below commented test cases working in local but failing in travis-ci because
# Elasticsearch running on travis-ci don't have data, until we load data, we commented these test cases.
# Scenario: Percentages in data table
#  When I see the number of deaths in data table
#  Then the percentages are shown for each row are displayed by default

#Scenario: Filter options updated
#  When I update criteria in filter options
#  Then data table is updated and the number of deaths and percentages are updated too

#Scenario: Items added to columns/rows
#  When I add new data items to row or columns
#  Then the percentages get re-calculated based on all the information displayed in a given row

#Scenario: Percentages display
#  When I see the data table
#  Then percentages are displayed in the same column/cell in parenthesis

#Scenario: Show/Hide percentages
#  When I see the results
#  Then an option to show/hide percentages is displayed
#  And when that option is toggled, the percentages are either displayed/hidden

#Scenario: enario: Decimal Precision
#  When I look at the table results
#  And percentage option is enabled
#  Then the Rates and Percentages should have a one decimal precision

#Scenario: Quick visualizations
#  When I see the quick visualizations
#  Then they're displayed same as before and nothing changes

#Scenario: Suppressed
#  When counts fall below the determined "cut-off" value and the conditions for suppression are met
#  Then the value should be suppressed

#Scenario: Data table
#  When the user looks at a suppressed value in the data table
#  Then the word suppressed must be displayed in it's place

Scenario: Age Adjusted Death Rates
  Given user is on search page
  When the user chooses the option 'Age Adjusted Death Rates'
  Then the age adjusted rates are shown for each row