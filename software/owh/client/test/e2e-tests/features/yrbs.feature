Feature: As a User
  I want the sidebar layout in YRBS to be similar to Mortality
  So that there is consistency in the design

Scenario: Access YRBS page
  When I am at home page
  And I click on Explore button in Youth Related card under Behavioral Risk
  Then I should get search page with default filter type "Youth Risk Behavior"

Scenario: Checkboxes
  When I looks at the filter sub categories
  Then I should be able to select more than one. The radio buttons must be changed to checkboxes

#Scenario: Default
 # Given user is on search page
 # Given user select YRBS as primary filter
  #Then the default filter pre-selected should be Race
 # And side menu slides back into view

Scenario: Hide Sidebar
  When user clicks hide filter button
  Then side menu slides away
  Then user sees button to show filters
  And then table and visualizations adjust to that they use up the entire available screen space
  And the background highlight is in lighter purple (button color)

Scenario: Un collapse sidebar
  When user clicks show filters button
  Then side menu slides back into view
  And the entire table and visualizations adjust to the reduced screen space
  And there is button to hide filter

#TODO: This scenario passing in local, need data to run on Travis-CI
#Scenario: show chart for each question
#  Given user is on search page
#  Given user select YRBS as primary filter
#  Then each question should have chart icon displayed

#Scenario: sort order
 # Given user is on search page
# Given user select YRBS as primary filter
 # Then filters should be in this order "year, yrbsSex, yrbsRace, yrbsGrade, question"


#Scenario: Category Collapsible
#  Given user is on search page
#  Given user select YRBS as primary filter
#  When the user clicks on the down arrow at the corner of each category bar
#  Then this category must be collapsible

#Scenario: Show # More
#  Given user is on search page
#  Given user select YRBS as primary filter
#  When the user clicks on Show # More under the questions in any category
#  Then the category should expand to show all the questions
#  And 'Show # More' should be replaced with 'Show Less'

#Scenario: Show Less
#  Given user is on search page
#  Given user select YRBS as primary filter
#  When the user clicks on Show # More under the questions in any category
#  When the user clicks on 'Show Less'
#  Then the category to reset back to the original view of the two questions
#  And 'Show Less' should be replaced with 'Show # More'

#Scenario: Default Questions
#    Given user is on search page
#    Given user select YRBS as primary filter
#    Then each category has two questions in the given order

#Scenario: Category Title
#    Given user is on search page
#    Given user select YRBS as primary filter
#    When the user hovers the mouse over a category name
#    Then an option/link to 'Show only this Category' should be seen

#Scenario: Show only this Category button
#    Given user is on search page
#    Given user select YRBS as primary filter
#    When the user hovers the mouse over a category name
#    When the user clicks on 'Show only this Category'
#    Then the data table must show only that category

#Scenario: Show all Categories link is visible
#    Given user is on search page
#    Given user select YRBS as primary filter
#    When the user hovers the mouse over a category name
#    When the user clicks on 'Show only this Category'
#    When the user hovers the mouse over a category name
#    Then an option/link to 'Show all Categories' should be seen

#Scenario: Show all Categories works
#    Given user is on search page
#    Given user select YRBS as primary filter
#    When the user hovers the mouse over a category name
#    When the user clicks on 'Show only this Category'
#    When the user hovers the mouse over a category name
#    When the user clicks on 'Show only this Category'
#    Then the data table should show all categories

Scenario: Data Alignment
  Given user is on search page
  Given user select YRBS as primary filter
  Then the data must be right justified in the table