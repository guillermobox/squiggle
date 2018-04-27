#include <stdio.h>
#include <stdlib.h>
#include <math.h>

int main(int argc, char *argv[]) {

	char * ptr;
	long int value;

	ptr = argv[1];
	value = strtol(ptr, &ptr, 10);

	printf("%ld\n", value*value);
	return EXIT_SUCCESS;
};
