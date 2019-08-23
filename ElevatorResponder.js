{
    init: function(elevators, floors) 
    {
        var floorsPendingUp = [];
        var floorsPendingDown = [];

        for (var i = 0; i < elevators.length; ++i)
        {
            initElevator(elevators[i]);
        }

        for (var i = 0; i < floors.length; ++i)
        {
            initFloor(floors[i], elevators);
        }

        function initElevator(elevator) 
        {
            elevator.on("idle", function() 
                        {
                var next = nextLogicalFloor(elevator.currentFloor());
                console.log("Next " + next);
                if (next != elevator.currentFloor())
                {
                    doGoToFloor(elevator, next);
                }
            });

            elevator.on("floor_button_pressed", function(floorNum) 
                        {
                //console.log("floor_button_pressed: " + floorNum);
                doGoToFloor(elevator, floorNum);
            });

            elevator.on("passing_floor", function(floorNum, direction) 
                        {
                //console.log("passing_floor " + floorNum + " " + direction);
                //console.log("floorsPendingUp " + floorsPendingUp);
                //console.log("floorsPendingDown " + floorsPendingDown);
                if (elevator.loadFactor() < 1 && !elevator.destinationQueue.includes(floorNum))
                {
                    if (direction == "up" && floorsPendingUp.includes(floorNum))
                    {
                        //setIndicators(elevator);
                        //console.log("going up");
                        floorsPendingUp = floorsPendingUp.filter(function(fn){ return fn == floorNum; });
                        doGoToFloor(elevator, floorNum);
                    }
                    else if (direction == "down" && floorsPendingDown.includes(floorNum))
                    {
                        //setIndicators(elevator);
                        floorsPendingDown = floorsPendingDown.filter(function(fn){ return fn == floorNum; });
                        doGoToFloor(elevator, floorNum);
                    }
                }
            });

            elevator.on("stopped_at_floor", function(floorNum) 
                        {
                //setIndicators(elevator);
            })
        }

        function initFloor(floor, elevators) 
        {
            floor.on("up_button_pressed", function() 
                     {
                //targetFloor(floor.floorNum(), elevators);
                if (!floorsPendingUp.includes(floor.floorNum())) { floorsPendingUp.push(floor.floorNum()); }
            });

            floor.on("down_button_pressed", function(floorNum) 
                     {
                //targetFloor(floor.floorNum(), elevators);
                if (!floorsPendingDown.includes(floor.floorNum())) { floorsPendingDown.push(floor.floorNum()) }
            });
        }

        function doGoToFloor(elevator, floorNum)
        {
            elevator.goToFloor(floorNum);
            sortDestinationQueue(elevator);
            //setIndicators(elevator);
        }

        function setIndicators(elevator)
        {
            var direction = 0;
            if (elevator.destinationQueue.length > 0) {
                direction = elevator.destinationQueue[0] - elevator.currentFloor();
            }
            console.log("Direction: " + direction + " " + elevator.destinationQueue + " " + elevator.currentFloor);
            if (direction < 0) { 
                elevator.goingDownIndicator(true); 
                elevator.goingUpIndicator(false); 
            }
            else if (direction > 0) { 
                elevator.goingDownIndicator(false); 
                elevator.goingUpIndicator(true); 
            }
            else {
                elevator.goingDownIndicator(true); 
                elevator.goingUpIndicator(true); 
            }
        }

        function isGoingUp(elevator)
        {
            return (elevator.destinationDirection() == "up");
        }

        function isGoingDown(elevator)
        {
            return (elevator.destinationDirection() == "down");
        }

        function sortDestinationQueue(elevator)
        {
            var cf = -1;
            if (elevator.destinationQueue.includes(elevator.currentFloor()))
            {
                cf = elevator.currentFloor();
            }
            var lowerFloors = elevator.destinationQueue.filter(function(floorNum){ return floorNum < elevator.currentFloor(); }).sort(function(a, b){return b - a});
            var higherFloors = elevator.destinationQueue.filter(function(floorNum){ return floorNum > elevator.currentFloor(); }).sort(function(a, b){return a - b});
            if (isGoingDown(elevator))
            {
                elevator.destinationQueue = lowerFloors.concat(higherFloors);
            }
            else
            {
                elevator.destinationQueue = higherFloors.concat(lowerFloors);
            }
            if (cf != -1) elevator.destinationQueue.unshift(cf);
            elevator.checkDestinationQueue();
            console.log("Sorted queue: " + elevator.destinationQueue);
        }

        function targetFloor(floorNum, elevators)
        {
            var headingToward = -1;
            for (var i = 0; i < elevators.length; ++i)
            {
                if (elevators[i].destinationQueue.includes(floorNum)) { return; }
                if (elevators[i].currentFloor < floorNum && isGoingUp(elevator)) { headingToward = i; }
                else if (elevators[i].currentFloor > floorNum && isGoingDown(elevator)) { headingToward = i; }
            }
            if (headingToward != -1) { doGoToFloor(elvators[i], floorNum); }
            else { doGoToFloor(elevators[0], floorNum); }
        }

        function nextLogicalFloor(currentFloor)
        {
            var pendingFloors = floorsPendingUp.concat(floorsPendingDown).sort(function(a, b){return b - a});
            console.log(pendingFloors);
            if (pendingFloors.length == 0) return 0;

            var closest = 9999;
            var floor = 0;

            console.log(currentFloor + " " + closest);
            for (var i = 0; i < pendingFloors.length; i++)
            {
                var test = Math.abs(currentFloor - pendingFloors[i]);
                console.log(test + " " + floor);
                if (test < closest)
                {
                    closest = test;
                    floor = i;
                }

                return floor;
            }
        }
    },
        update: function(dt, elevators, floors) 
    {
        // We normally don't need to do anything here
    }
}
