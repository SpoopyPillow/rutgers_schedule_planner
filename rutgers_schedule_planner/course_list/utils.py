from django.http.request import QueryDict, MultiValueDict


def dict_to_querydict(dictionary):
    qdict = QueryDict("", mutable=True)
    qdict.update(MultiValueDict(dictionary))
    return qdict
