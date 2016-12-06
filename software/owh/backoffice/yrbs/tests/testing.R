################################################################
############   Testing Notebook for YRBSS R code   #############
################################################################

### When you run this notebook, you need to adjust file paths to fit your setup.
### First, load the source code.

source('c:/Users/Rex/Desktop/yrbs/R/YRBSS.R')
"OK"

### Now do some smoke-testing.
### We load the national data and perform various operations.
### First we test the function that loads the data file and 
### extracts the right state and year from the data.

rda.path = "C:/Users/Rex/Desktop/OWH/owh-ds/software/owh/backoffice/yrbs/rda/"
rda.path = "C:/Users/Rex/Desktop/yrbs/rda/"
load(paste0(rda.path,"sadc_2015_national.rda"))
kolumns = colnames(sadc.2015.national.df)
#cat(kolumns)
odd = c(1,3,5,7,9)
gc()

### These just check that we can load the appropriate state and year, and return
### an error message if not.
dim.l.y = function(state,year) nrow(get.df.for.state.and.year(state,year,rda.path))    
print(dim.l.y('XX', 2015))
print(dim.l.y('XX', 2011))
print(dim.l.y('XX', 2009))
print(dim.l.y('MT', 2015))
print(dim.l.y('MT', 2011))
print(dim.l.y('MT', 2009))
print(dim.l.y('NC', 2015))
print(dim.l.y('NC', 2011))
print(dim.l.y('NC', 2009))
print(get.df.for.state.and.year('MT', 1909, rda.path))
gc()
    

### Next we smoke-test yrbssCalculate. 
### We focus on Q8 (Bicycle Helmet Use) and Q9 (Drinking Driver). 
### We just make a number of calls to be sure the function returns 
### a matrix of the right shape and numbers of the right scale (percentages).
### We have a couple of cases to check basic error handling.

### These are just a smoke test of yrbssCalculate.  Arguments that would normally be passed are
### allowed to default.


cat('\n\n', yrbssCalculate(filter=list(q8=1:2), rda.path=rda.path))
cat('\n\n', yrbssCalculate(filter=list(q8=1:2), state='MT', year = 2011, rda.path=rda.path) )
cat('\n\n', yrbssCalculate(filter=list(q8=1:2), state='MM', year = 2011, rda.path=rda.path) )
cat('\n\n', yrbssCalculate(filter=list(q9=c(1,3,5)), rda.path=rda.path) )
cat('\n\n', yrbssCalculate(filter=list(q8=1:2, q9=c(1,3,5)), rda.path=rda.path) )
cat('\n\n', yrbssCalculate(filter=list(q1=c(4, 5, 6), # age 15-18
                            q2=c(1), # female
                            q5=c("C","E")), rda.path=rda.path)) # bogus
cat('\n\n', yrbssCalculate(filter=list(queue8=1:2), rda.path=rda.path) )  
    
### These examples illustrate caching.  We cache a dataframe for Montana/2011
### and use it twice.  Third time we get an error.
df.MT.2011 = get.df.for.state.and.year('MT',2011,rda.path)
cat('\n\n', yrbssCalculate(filter=list(q8=1:2), state='MT', year = 2011, df=df.MT.2011) )
cat('\n\n', yrbssCalculate(filter=list(q9=odd), state='MT', year = 2011, df=df.MT.2011) )
cat('\n\n', yrbssCalculate(filter=list(q8=1:2), state='MS', year = 2013, df=df.MT.2011) )

### Now we do a more systematic test of the group-by functionality. 
### We set up a contrived matrix, group by (nearly) all possible 
### pairs of columns, and look at all remaining columns as response variables.

test.vec = function (i,n) c(rep(1,i), rep(0,n-i))    
m = sapply(1:20,test.vec,20)
m = rbind(m,matrix(rep(NA,100),ncol=20))
m = data.frame(m)
m$PSU = 1:25
m$stratum = rep(1,25)
m$weight = rep(1,25)
m

correct.column3 = function(g1,g2,r) {
    if (r>g1 && r<g2) {
        c(20-g2, 0, 20-g2, g2-g1, g1, g2, 20-g1, g1, 20)
    }
}

correct.column3(4,17,12)

res = yrbssCalculate(df=m, state='99', group.by=list("X4","X17"), positives=list(X12=1), filter=NULL, out.format="matrix")
res

any(res[,3]!=correct.column3(4,17,12))

test.column = function(k) function(m,g1,g2,r) {
    group.by = as.list(paste0("X", c(g1,g2)))
    pos.name = paste0("X",r)
    positives = NULL
    positives[[pos.name]] = 1
    res = yrbssCalculate(df=m, state="99", group.by=group.by, positives=positives, filter=NULL, out.format="matrix")
    res[,k]
}

test.column4 = test.column(4)
test.column3 = test.column(3)

test.column3(m,4,17,12)

correct.column4 = function(g1,g2,r) {
    v =
    c(0,
      0,
      0,
     (r-g1)/(g2-g1),
      1,
      r/g2,
      (r-g1)/(20-g1),
      1,
      r/25)  
    return(round(100*v,2))
}
correct.column4(4,17,12)

test.matrix = function () {
    errors = 0
    for (g1 in 1:17) {
        for (g2 in (g1+2):19) {  # would have to rewrite correct.column3 to check g2=20
            for (r in (g1+1):(g2-1)) {
                if (any(test.column3(m,g1,g2,r) != correct.column3(g1,g2,r))) {
                    cat("Failure for (g1,g2,r) column 3 = ", c(g1,g2,r), "\n")
                    errors = errors + 1
                }  
                if (any(test.column4(m,g1,g2,r) != correct.column4(g1,g2,r))) {
                    cat("Failure for (g1,g2,r) column 4 = ", c(g1,g2,r), "\n")
                    cat(test.column4(m,g1,g2,r),"\n",correct.column4(g1,g2,r), "\n\n")
                    errors = errors + 1
                }                
            }
        }
    }
    cat(errors, " errors in m\n")
    errors = 0
    m1 = m[sample(25),]  # permute rows and try again.
    for (g1 in 1:17) {
        for (g2 in (g1+2):19) {  # would have to rewrite correct.column3 to check g2=20
            for (r in (g1+1):(g2-1)) {
                if (any(test.column3(m1,g1,g2,r) != correct.column3(g1,g2,r))) {
                    cat("Failure for (g1,g2,r) column 3 = ", c(g1,g2,r), "\n")
                    errors = errors + 1
                }   
                if (any(test.column4(m1,g1,g2,r) != correct.column4(g1,g2,r))) {
                    cat("Failure for (g1,g2,r) column 4 = ", c(g1,g2,r), "\n")
                    cat(test.column4(m,g1,g2,r),"\n",correct.column4(g1,g2,r), "\n\n")
                    errors = errors + 1
                }                
            }
        }
    }
    cat(errors, " errors in m1\n")
}

test.matrix()
test.column3(m,9,20,18)  # is correct.

### Now some systematic testing of filtering.
### We set up a matrix in which the columns are exactly the binary 
### representation of the integers 0 to 127. 
### Then we filter on combinations of columns, 
### and look at another column as response variable. 
### We should always find a proportion of 1/2, by construction.

### Now a new matrix....
kol = function(i,m) rep(c(rep(0,2^(i-1)), rep(1,2^(i-1))), 2^(m-i))
kol(3,5)

m = data.frame(sapply(1:6, kol, 7))
m$PSU = 1:2^7
m$weight = rep(1,2^7)
m$stratum = rep(1,2^7)
m
yrbssCalculate(df=m,state="99",filter=list(X1=0,X3=1), positive=list(X2=1), group.by=NULL, out.format="matrix")

errors = 0
for (i in 1:5) {
    for (j in 1:10) {
        s = sample(6,i+1)
        fil = s[-1]
        pos = s[1]
        fil = paste0("X",fil)
        pos = paste0("X",pos)
        positive=NULL
        positive[[pos]] = sample(0:1, 1)
        filters = NULL
        for (x in fil) {
            filters[[x]] = sample(0:1, 1)
        }
        mat = yrbssCalculate(df=m,state="99",filter=filters, positive=positive, group.by=NULL, out.format="matrix")
        if (mat[1,1] != 2^(7-i) | mat[2,1] != 2^(7-i) | mat[1,2] != 50 | mat[2,2] != 50) {
            print("ERROR!")
            print(mat)
            errors = errors + 1
        }
    }
}
cat(errors, "errors.")