Feature: As a User
  I want the sidebar layout in YRBS to be similar to Mortality
  So that there is consistency in the design
  I want to see the YRBS question categories in the given order
  So that I can see the most important question categories first

Scenario: Access YRBS page from home page
  When I am at home page
  And I click on Explore button in Youth Related card under Behavioral Risk
  Then I should get search page with default filter type "Youth Risk Behavior"

Scenario: Accesss YRBS from search page
  Given I am on search page
  #Given user select YRBS as primary filter
  When I select YRBS as primary filter
  Then the default filter pre-selected should be Race
  And side menu slides back into view

Scenario: Hide Sidebar
  When I click hide filter button
  Then side menu slides away
  Then I see button to show filters
  And then table and visualizations adjust to that they use up the entire available screen space
  And the background highlight is in lighter purple (button color)

Scenario: Un collapse sidebar
  When I click show filters button
  Then side menu slides back into view
  And the entire table and visualizations adjust to the reduced screen space
  And there is button to hide filter

#Scenario: show chart for each question
  #  Given I am on search page
  #Given user select YRBS as primary filter
  #  When I change 'I'm interested in' dropdown value to "Youth Risk Behavior"
  # Then each question should have chart icon displayed

Scenario: sort order
  When I looks at the filter sub categories
  Then I should be able to select more than one. The radio buttons must be changed to checkboxes
  And filters should be in this order "year, yrbsSex, yrbsRace, yrbsGrade, question"

Scenario: Category Collapsible
  When I click on the down arrow at the corner of each category bar
  Then this category must be collapsible

Scenario: Show # More
  When I click on Show # More under the questions in any category
  Then the category should expand to show all the questions
  And 'Show # More' should be replaced with 'Show Less'

Scenario: Show Less
  When I click on 'Show Less'
  Then the category to reset back to the original view of the two questions
  And 'Show Less' should be replaced with 'Show # More'

Scenario: Category Title
  When I hover the mouse over a category name
  Then an option/link to 'Show only this Category' should be seen

Scenario: Show only this Category button
  When I click on 'Show only this Category'
  Then the data table must show only that category

Scenario: Show all Categories link is visible
  When I hover the mouse over a category name
  Then an option/link to 'Show all Categories' should be seen

Scenario: Show all Categories works
  When I click on 'Show all Categories'
  Then the data table should show all categories

Scenario: Race/Ethnicity label
  Then race filter should be labeled Race/Ethnicity
  Scenario: Data Alignment
  Then the data must be right justified in the table

#Scenario: Show all odd years from 1991-2015
#  When Click on show more on year filter
#  Then year filter should list all odd years 1991-2015

#Scenario: Group by year
#  When Group by year is selected
#  Then results should be grouped by year

Scenario: YRBS question categories in the given order
  When I expand "Question" filter section
  And I select "Select Questions" button
  Then I see question categories in this order "Unintentional Injuries and Violence", "Tobacco Use", "Alcohol and Other Drug Use", "Sexual Behaviors", "Physical Activity", "Obesity, Overweight, and Weight Control", "Dietary Behaviors", "Other Health Topics"

Scenario: Pop-up
  When I click on "Select Questions" button
  Then the pop up box should open up (just like UCD pop up) with a list- tree pattern- of categories of Survey Questions
  And it should also have a Search Questions - search bar above the list

Scenario: Default
  When I open up the Survey Question pop up
  Then by default no questions should be selected

Scenario: Search Questions
  When I begin to type a word in the search bar
  Then the list below that should be updated dynamically

#Frist scenario working, once we add + icon update second scenario
#Scenario: + sign
#  When I hovers his mouse on any of the questions from the list
#  Then a + sign appears in the end of the question to indicate the user that he can click to add the question

#Scenario: - sign
 # When I have selected a question
  #Then the + sign changes to - sign to indicate the user that he can click to deselect the question

Scenario: Selected Survey Question(s)
  When I have selected a question
  Then another heading - "Selected Question(s)" must appear on the top of the 'Search Questions' search bar
  And then the selected question must be listed under the Selected Question(s)

Scenario: Delete x
  When I see the selected questions under the Selected Question(s) list
  Then I should also be able to see a x button to the end of the question
  And I click on this button then that particular question is deleted from the list (deselected)

Scenario: Data Table
  When I select a few questions and clicks on the Add Selected Question(s) button
  Then the data table should update based on the selection

Scenario: Clear
 When I see the selected questions under the Selected Question(s) list in side filter
 Then I should also see a "Clear" button at the end of the selected questions list
 And I click on this button, then all the selected questions are deleted from the list (deselected)

Scenario: Edit Selection and Clear buttons
  When I click on "Select Questions" button
  And I select a few questions and clicks on the Add Selected Question(s) button
  Then the "Select Questions" button should be renamed to "Update Questions"