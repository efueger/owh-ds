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
  Then I should get search page with default filter type "Mortality"

Scenario: Axis labels
  When user sees a visualization
  Then labels are displayed on both the axes for minimized visualization
  When user expand visualization
  Then labels are displayed on both the axes for expanded visualization

Scenario: Side filter collapse
  Given I am on search page
  Then user sees side filter
  Then there is button to hide filter
  When I click hide filter button
  Then side menu slides away
  Then I see button to show filters
  When I click show filters button
  Then side menu slides back into view

Scenario: Side filter options retain order
  Given I am on search page
  When user expands race options
  Then user clicks on "+ 2 more" more link for "Race" filter
  When user selects second race option
  Then race options retain their initial ordering

Scenario: Display show/hide percentage button only on mortality page
  When I am at home page
  And  I click on Explore button in Health Information Gateway section
  Then I should get search page with default filter type "Mortality"
  And an option to show/hide percentages is displayed
  When I change 'I'm interested in' dropdown value to "Youth Risk Behavior"
  Then I should be redirected to YRBS page
  And show/hide percentages button shouldn't display

Scenario: Death Rates
  Given I am on search page
  When the user chooses the option 'Death Rates'
  Then the rates are shown for each row (with the Total population, from Bridge Race Estimates, as the denominator) - and not the total number of deaths shown in the table

Scenario: Dropdown Location
  Given I am on search page
  Then dropdown is in the main search bar

Scenario: Decimal Precision
  Given I am on search page
  Then the Percentages should have a one decimal precision

Scenario: Percentages in data table
  When I see the number of deaths in data table
  Then the percentages are shown for each row are displayed by default

Scenario: Filter options updated
  When I update criteria in filter options with column "Autopsy"
  Then data table is updated and the number of deaths and percentages are updated too

Scenario: Items added to columns/rows
  When I add new data items to row or columns
  Then the percentages get re-calculated based on all the information displayed in a given row

Scenario: Percentages display
  When I see the data table
  Then percentages are displayed in the same column/cell in parenthesis

Scenario: Show/Hide percentages
  When I see the results
  Then an option to show/hide percentages is displayed
  And when that option is toggled, the percentages are either displayed/hidden

Scenario: Decimal Precision
  When I look at the table results
  And percentage option is enabled
  Then the Rates and Percentages should have a one decimal precision

Scenario: Quick visualizations
  Given I am on search page
  When I see the quick visualizations
  Then they're displayed same as before and nothing changes

Scenario: Help Message above the quick visualization pane
  Given I am on search page
  When the user chooses the option 'Death Rates'
  Then the following message should be displayed stating that population data is being retrieved from Census "Population details from NCHS Bridge Race Estimates is used to calculate Death Rates (per 100,000)"

Scenario: Years are supposed to be in descending order
  Given I am on search page
  When user sees side filter
  Then user clicks on "+ 12 more" more link for "Year" filter
  Then years should be in descending order

Scenario: Ethnicity Filter
  Given I am on search page
  When user expands ethnicity filter
  Then user should see two subcategories- Hispanic and NonHispanic

Scenario: Check box
  Given I am on search page
  When user expands ethnicity filter
  When user checks entire Hispanic group
  Then all Hispanic child options should be checked

Scenario: Ethnicity Hispanic Group
  Given I am on search page
  When user expands ethnicity filter
  When user expands hispanic option group
  Then user should see all the of the Hispanic Origin options grouped(Central American,Cuban,Dominican,Latin American, Mexican, Puerto Rican, South American,Spaniard, Other Hispanic, Unknown) under one Category- Hispanic

Scenario: Check box- Hispanic Sub Categories
  Given I am on search page
  When user groups ethnicity by row
  When user expands ethnicity filter
  When user expands hispanic option group
  When user checks some options under hispanic group
  Then data should be filtered by the checked hispanic options

Scenario: Race options should be in proper order
  Given I am on search page
  When user sees side filter
  Then user expands race options
  Then user clicks on "+ 2 more" more link for "Race" filter
  Then race options should be in proper order

Scenario: Autopsy options should be in proper order
  Given I am on search page
  When user sees side filter
  Then user expands autopsy filter
  Then autopsy options should be in proper order


#Scenario: Suppressed
#  When counts fall below the determined "cut-off" value and the conditions for suppression are met
#  Then the value should be suppressed

#Scenario: Data table
#  When the user looks at a suppressed value in the data table
#  Then the word suppressed must be displayed in it's place

Scenario: Age Adjusted Death Rates
  Given I am on search page
  When the user chooses the option 'Age Adjusted Death Rates'
  Then the age adjusted rates are shown for each row

Scenario: Age filter for age adjusted rates
  Given I am on search page
  When the user chooses the option 'Age Adjusted Death Rates'
  Then the age filter should be hidden

Scenario: Side filter total suppression
  Given I am on search page
  When user shows more year filters
  And user filters by year 2013
  Then user expands race options
  And user clicks on "+ 2 more" more link for "Race" filter
  When user expands ethnicity filter
  When user expands hispanic option group
  And user filters by ethnicity Spaniard
  Then user should only see total for white race in side filter

Scenario: Ethnicity order
  Given I am on search page
  When user expands ethnicity filter
  And user expands hispanic option group
  Then ethnicity filters should be in given order

Scenario: Filer 'Multiple Causes of Deaths' should be displayed
  Given I am on search page
  When user sees side filter
  Then filter "Multiple Causes of Death" should be displayed

Scenario: Data should be right aligned
  Given I am on search page
  When I update criteria in filter options with column "Autopsy"
  When I update criteria in filter option with row "Sex"
  Then data should be right aligned in table

#Scenario: Rates, Deaths and Population values closer to each other
#  Given I am on search page
#  When I choose the option "Crude Death Rates"
#  Then Rates, Deaths and Population values look as a single data element in the column
#  When I select "Column" type for "Race" filter
#  Then Rates, Deaths and Population shouldn't be overlap

Scenario: Bookmark link
  When I select the "Bookmark" link in application
  Then browser's bookmarking window should be displayed to save the link to Browser

Scenario: Bookmark link UI
  Given I am on search page
  When I hovers on the bookmark link
  Then the link gets a background box so that I feel it like a button/action

#This scenario opening bookmark window but unable to find the tex on bookmark window.
#Scenario: Bookmark link
#  When I select the "Bookmark this search" link in application
#  Then browser's bookmarking window should be displayed to save the link to Browser

#Unable to find a way to click on button
#Scenario: Launching the bookmark
#  When I selects a saved bookmark
#  Then all the search parameters should be autopopulated and search results should be displayed