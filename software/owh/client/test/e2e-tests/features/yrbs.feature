Feature: YRBS Page

Scenario: Category Collapsible
  Given user is on search page
  Given user select YRBS as primary filter
  When the user clicks on the down arrow at the corner of each category bar
  Then this category must be collapsible

Scenario: Show # More
  Given user is on search page
  Given user select YRBS as primary filter
  When the user clicks on Show # More under the questions in any category
  Then the category should expand to show all the questions
  And 'Show # More' should be replaced with 'Show Less'

Scenario: Show Less
  Given user is on search page
  Given user select YRBS as primary filter
  When the user clicks on Show # More under the questions in any category
  When the user clicks on 'Show Less'
  Then the category to reset back to the original view of the two questions
  And 'Show Less' should be replaced with 'Show # More'
