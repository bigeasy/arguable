## Sun Jul 15 23:23:47 CDT 2018

Once again, I need to rethink what it means to return form the main method.
Right now we return the exit code from the error-first callback. The error-first
callback means we can respond to an error by exiting non-zero. I'm not seeing,
though, how to unwind the program from a deep error. An early error on
validation, that still currently works, but now that I'm enclosing the main
method in a nested main method that runs a destructible, it means that if I
where to try to use validation in that nested main method, Arguable would not
find it because it is wrapped.

I imagine maybe testing to see if it is an Interrupt and then having some sort
of path mechanism in Interrupt. Maybe even going so far as to have a way to
convert an interrupt into a tree and to remove paths so that you could remove an
error of certain type, then see that the tree is now empty. Thus, that was the
only real error and no other error needs to be reported.
