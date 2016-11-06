Feature: YRBS Page

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

Scenario: Category Title
    Given user is on search page
    Given user select YRBS as primary filter
    When the user hovers the mouse over a category name
    Then an option/link to 'Show only this Category' should be seen

Scenario: Show only this Category button
    Given user is on search page
    Given user select YRBS as primary filter
    When the user hovers the mouse over a category name
    When the user clicks on 'Show only this Category'
    Then the data table must show only that category

Scenario: Show all Categories link is visible
    Given user is on search page
    Given user select YRBS as primary filter
    When the user hovers the mouse over a category name
    When the user clicks on 'Show only this Category'
    When the user hovers the mouse over a category name
    Then an option/link to 'Show all Categories' should be seen

Scenario: Show all Categories works
    Given user is on search page
    Given user select YRBS as primary filter
    When the user hovers the mouse over a category name
    When the user clicks on 'Show only this Category'
    When the user hovers the mouse over a category name
    When the user clicks on 'Show only this Category'
    Then the data table should show all categories

Scenario: Default Questions
    Given user is on search page
    Given user select YRBS as primary filter
    Then each category has two questions in the given order
