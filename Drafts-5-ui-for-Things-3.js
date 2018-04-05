// See below links for detailed explainations of the Javascript used in this script
// http://drafts5-help.agiletortoise.com/
// https://github.com/agiletortoise/drafts-documentation/wiki/Things
// https://support.culturedcode.com/customer/en/portal/articles/2803573-things-url-scheme

// split draft to prepare for iteration
const lines = draft.content.split("\n");
var todos = []
var skipped = []
var taskNum = 0

// Begin todo creation loop
for (line of lines) {
    taskNum += 1
    var p = Prompt.create();

    p.title = "Task " + taskNum + ": " + line;
    // add a task message if desired
    // p.message = "What kind of task is this?";

    p.addTextField("todoNote", "Note: ", "", {
        "placeholder" : "Add details here", 
        "autocorrect" : true, 
        "autocapitalization": "sentences"});

    // Change these buttons to personalize to your own project lists
    // You will also have to change button name in IF statements starting line 52
    p.addButton("Add to Chores");
    p.addButton("Add to Shopping List");
    p.addButton("Capture to Inbox");

    p.addSwitch("dateSwitch", "Add a date to this Task?", false);
    p.addDatePicker("myDate", "", new Date(), {
        "mode": "date"
    });

    var didSelect = p.show();

    // Create the things todo js object
    var todo = TJSTodo.create();
    todo.title = line;
    todo.notes = p.fieldValues["todoNote"];

    // Conditionals to append details to the todo task object
    if (p.fieldValues["dateSwitch"]) {
        var myDate = p.fieldValues["myDate"];
        // splitting up the datetime string to return ONLY the date
        todo.when = myDate.toDateString();
    }

    // if the project button names were changed, then change the names in this conditional statement too
    if (p.buttonPressed == "Add to Chores") {
        todo.list = "Chores";
        todos.push(todo);
    } else if (p.buttonPressed == "Add to Shopping List") {
        todo.list = "Shopping List";
        todos.push(todo);
    } else if (p.buttonPressed == "Capture to Inbox") {
        todo.list = "";
        todos.push(todo);
    }

    // Ensure that a task is skipped if "Cancel" button is tapped
    if (didSelect === false){
        // log the skipped todos
        skipped.push(line)
        continue;
    }
}


    // trigger a failed draft action if no todos were logged
if (todos == []){
    context.fail();
} else {
    // create a container to handle creation of Things URL
    const container = TJSContainer.create(todos);

    // create and configure callback object
    var cb = CallbackURL.create();
    cb.baseURL = container.url;
    var success = cb.open();
    if (success) {
        console.log("Todo created in Things");
        var d = Draft.create();
        d.content = skipped.join("\n");
        d.update();
        var draftID = d.uuid
        var cb2 = CallbackURL.create();
        cb2.baseURL = "drafts5://x-callback-url/open?uuid=" + draftID;
        cb2.open();
    }
    else { // something went wrong or was cancelled
        console.log(cb.status);
        if (cb.status == "cancel") {
            context.cancel();
        }
        else {
            context.fail();
        }
    }
}
