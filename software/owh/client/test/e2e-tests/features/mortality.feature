Feature: Mortality page
  As a user
  I should be able to access mortality page
  I want to see labels on X and Y axis on the quick visualization
  So that I can instantly know what data is plotted on which axis
  I want to see raw data and percentages (as default results) when I select to view "Number of Deaths" in the main search bar
  So that I can see percentages along with number of deaths

Scenario: Access mortality page
  When I am at home page
  And  I click on Explore button in Quick Health Data Online section
  Then I should get search page with default filter type mortality

Scenario: Axis labels
  When user sees a visualization
  Then labels are displayed on both the axes for minimized visualization
  When user expand visualization
  Then labels are displayed on both the axes for expanded visualization

Scenario: Side filter collapse
  Given user is on search page
  Then user sees side filter
  Then there is button to hide filter
  When user clicks hide filter button
  Then side menu slides away
  Then user sees button to show filters
  When user clicks show filters button
  Then side menu slides back into view

Scenario: Category Collapsible
  When the user clicks on the down arrow at the corner of each category bar
  Then this category must be collapsible

Scenario: Show # More
  When the user clicks on Show # More under the questions in any category
  Then the category should expand to show all the questions
  And 'Show # More' should be replaced with 'Show Less'

Scenario: Show Less
  When the user clicks on 'Show Less'
  Then the category to reset back to the original view of the two questions
  And 'Show Less' should be replaced with 'Show # More'

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
#  Then an option to view/hide percentages is displayed
#  And when that option is toggled, the percentages are either displayed/hidden

#Scenario: enario: Decimal Precision
#  When I look at the table results
#  And percentage option is enabled
#  Then the Rates and Percentages should have a one decimal precision

#Scenario: Quick visualizations
#  When I see the quick visualizations
#  Then they're displayed same as before and nothing changes