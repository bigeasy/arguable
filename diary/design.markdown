# Arguable Design

Currently wondering what to do about missing commands. If the programmer
does not specify a default, what is the correct action to take? Nothing matches.
But it means that if the user specifies `frobinate foo` and there is no `foo`
command that the default is invoked.

I'm looking at `git` and seeing that there is no default command. If you invoke
the default command, you get a message saying that there is no such command.

Therefore, I believe there should always be a default command, and that the
validation for that command should attempt to report a missing command, if it is
at all able to detect it.

`svn` behaves the same way.
