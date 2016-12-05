########################################################################
######             Numerical Validation of R Functions            ######
########################################################################

# This code is to show that our computation of proportions and confidence 
# intervals is consistent with what appears on the CDC website for YRBSS.  
# We use the xlogit method of the svyciprop function in the survey package.
# To get the same figures as the website, we must pass in degrees of freedom 
# from the overall design rather than allowing svyciprop to calculate 
# degrees of freedom for the subsetted data.


# Read file
library("survey")
load("C:/Users/Rex/Desktop/OWH/yrb2015.Rdata")
packageVersion('survey')
dim(AA)

# Attach level to demographic columns
levels(AA$Q1) = c("","<=12","13","14","15","16","17",">=18")
levels(AA$Q2) = c("","Female","Male")
levels(AA$Q3) = c("","9th","10th","11th","12th","Other")
levels(AA$Q4) = c("","Yes","No")
levels(AA$RACEETH) =  c("","AI/AN","Asian","Black-African-American","NH/PI","White",
                        "Hispanic/Latino","Multiple-Hispanic","Multiple-Non-Hispanic")

# change YES=1 No=2 to YES=1 NO=0
AA$QN8 = 2 - AA$QN8


# Turn demographic columns in to factors.
AA$Q1 = factor(as.character(AA$Q1))
AA$Q2 = factor(as.character(AA$Q2))
AA$Q3 = factor(as.character(AA$Q3))
AA$Q4 = factor(as.character(AA$Q4))
AA$RACEETH = factor(as.character(AA$RACEETH))
AA$Q3 = relevel(AA$Q3,ref="9th")


# Label columns.
names(AA)[1:4] = c("Age","Sex","Grade","Eth")
names(AA)[237] = "Race"

tidy = function(res) {
    foo = round(100*c(mean(res),SE(res), confint(res)), 2)
    names(foo)  = NULL
    foo
}

yrbs = svydesign(ids=~PSU,
                 strata=~STRATUM,
                 weights=~WEIGHT,
                 data=AA)
# Stratified 1 - level Cluster Sampling design (with replacement)
# With (54) clusters.
# svydesign(ids = ~PSU, strata = ~STRATUM, weights = ~WEIGHT, data = D)


process.combination = function(AA,g,r,s) {
    condition = TRUE
    if (g != 'Total') {
        condition = condition & AA$Grade==g
    }
    if (r != 'Total') {
        condition = condition & AA$Race==r
    }
    if (s != 'Total') {
        condition = condition & AA$Sex==s
    }
        
    
    print(paste(g,r,s))
    cat(file=f,paste(paste(g,r,s), ','))
    ss = subset(yrbs,condition)
    ss2 = subset(yrbs, condition & !is.na(AA$QN8))
    cat(file=f,nrow(ss2),',')
    if (nrow(ss2)==0) {
        print(c(nrow(ss2), "N/A"))
        cat(file=f,"NA,")
    } else {
            ######## HERE IS THE KEY COMPUTATION 
            df = degf(yrbs)
            v = svyciprop(~QN8, ss, method="xlogit", na.rm=TRUE, df=df)

            foo = tidy(v)
            print(c(nrow(ss2),foo))
            cat(file=f,paste(foo[1],',',foo[2],',',foo[3],',',foo[4],'\n'))
    }
    cat("\n")
}

f = file("foo.csv","w")
for (g in c('Total','9th', '10th','11th','12th')) {        
    for (r in c('Total','Asian','Black-African-American', 'White')) {
        for (s in c('Total','Female','Male')) {
           # for (a in c('14','15','16')) {
                  process.combination(AA,g,r,s)
         #   }
        }
    }
}
close(f)
